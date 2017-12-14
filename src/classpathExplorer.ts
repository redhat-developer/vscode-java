import * as vscode from 'vscode';
import { Commands } from './commands';
import { Uri } from 'vscode';

enum NodeKind {
    Project = 'Project',
    Container = 'Container',
    Jar = 'Jar',
    Package = 'Package',
    Classfile = 'Classfile',
    Source = 'Source'
}

interface IClasspathNode {
    name: string;
    path: string;
    kind: string;
    children?: IClasspathNode[];
}

export class ClasspathExplorer implements vscode.TreeDataProvider<ClasspathItem> {

    constructor(public readonly context: vscode.ExtensionContext) {
        context.subscriptions.push(vscode.commands.registerCommand(Commands.VIEW_CLASSPATH_REFRESH, this.refresh, this));
        context.subscriptions.push(vscode.commands.registerCommand(Commands.VIEW_CLASSPATH_OPEN_FILE, this.openFile, this));
    }

    private _projectItems: ClasspathItem[] = null;

    private _onDidChangeTreeData: vscode.EventEmitter<null> = new vscode.EventEmitter<null>();

    public readonly onDidChangeTreeData: vscode.Event<null> = this._onDidChangeTreeData.event;

    getTreeItem(element: ClasspathItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: ClasspathItem): vscode.ProviderResult<ClasspathItem[]> {
        if (!this._projectItems) {
            this._projectItems = this.getRootProjects();
            return this._projectItems;
        } else {
            return element.getChildren().then((children) => {
                return children.sort((a, b) => a.name > b.name ? 1 : -1);
            });
        }
    }

    public refresh() {
        this._projectItems = null;
        this._onDidChangeTreeData.fire();
    }

    public openFile(...args) {
        return vscode.commands.executeCommand(Commands.EXECUTE_WORKSPACE_COMMAND, Commands.VIEW_CLASSPATH_FETCH, NodeKind.Source, args)
            .then((content: string) => {
                if (!content) {
                    vscode.window.showWarningMessage('Source code is not available for the selected file');
                } else {
                    vscode.workspace.openTextDocument({ language: 'java', content }).then((res) => {
                        vscode.window.showTextDocument(res);
                    });
                }
            });
    }

    private getRootProjects() {
        const result: ClasspathItem[] = new Array<ClasspathItem>();
        const folders = vscode.workspace.workspaceFolders;
        if (folders && folders.length) {
            folders.forEach((folder) => result.push(new ProjectItem({
                name: folder.name,
                path: folder.uri.toString(),
                kind: NodeKind.Project
            }, null, this.context)));
        }
        return result;
    }
}

abstract class ClasspathItem extends vscode.TreeItem {
    constructor(private _classpath: IClasspathNode, private _project: ClasspathItem, public readonly context: vscode.ExtensionContext) {
        super(_classpath.name, _classpath.kind === NodeKind.Classfile ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed);
    }

    public get name() {
        return this._classpath.name;
    }

    public get path() {
        return this._classpath.path;
    }

    public get kind() {
        return this._classpath.kind;
    }

    public get project(): ClasspathItem {
        return this._project;
    }

    public get classpathNode(): IClasspathNode {
        return this._classpath;
    }

    public async getChildren(): Promise<ClasspathItem[]> {
        if (!this._classpath.children) {
            this._classpath.children = await this.loadData();
        }
        return this.createClasspathItemList();
    }

    protected abstract loadData(): Thenable<IClasspathNode[]>;

    protected abstract createClasspathItemList(): ClasspathItem[];
}

class ProjectItem extends ClasspathItem {
    constructor(classpath: IClasspathNode, project: ClasspathItem, public readonly context: vscode.ExtensionContext) {
        super(classpath, project, context);
        this.iconPath = context.asAbsolutePath('./images/project.gif');
    }

    protected loadData(): Thenable<IClasspathNode[]> {
        return vscode.commands.executeCommand(Commands.EXECUTE_WORKSPACE_COMMAND,
            Commands.VIEW_CLASSPATH_FETCH, NodeKind.Container,
            [this.path]);
    }

    protected createClasspathItemList(): ClasspathItem[] {
        const result = [];
        if (this.classpathNode.children && this.classpathNode.children.length) {
            this.classpathNode.children.forEach((classpathNode) => {
                result.push(new LibraryItem(classpathNode, this, this.context));
            });
        }
        return result;
    }

}

class LibraryItem extends ClasspathItem {

    constructor(classpath: IClasspathNode, project: ClasspathItem, public readonly context: vscode.ExtensionContext) {
        super(classpath, project, context);
        this.iconPath = context.asAbsolutePath('./images/library.png');
    }

    protected loadData(): Thenable<IClasspathNode[]> {
        return vscode.commands.executeCommand(Commands.EXECUTE_WORKSPACE_COMMAND,
            Commands.VIEW_CLASSPATH_FETCH, NodeKind.Jar,
            [this.project.path, this.path]);
    }

    protected createClasspathItemList(): ClasspathItem[] {
        const result = [];
        if (this.classpathNode.children && this.classpathNode.children.length) {
            this.classpathNode.children.forEach((classpathNode) => {
                result.push(new JarItem(classpathNode, this.project, this.context));
            });
        }
        return result;
    }

}

class JarItem extends ClasspathItem {
    constructor(classpath: IClasspathNode, project: ClasspathItem, public readonly context: vscode.ExtensionContext) {
        super(classpath, project, context);
        this.iconPath = context.asAbsolutePath('./images/jar_src.png');
    }

    protected loadData(): Thenable<IClasspathNode[]> {
        return vscode.commands.executeCommand(Commands.EXECUTE_WORKSPACE_COMMAND,
            Commands.VIEW_CLASSPATH_FETCH, NodeKind.Package,
            [this.project.path, Uri.file(this.path).toString()]);
    }

    protected createClasspathItemList(): ClasspathItem[] {
        const result = [];
        if (this.classpathNode.children && this.classpathNode.children.length) {
            this.classpathNode.children.forEach((classpathNode) => {
                result.push(new PackageItem(classpathNode, this.project, this.context));
            });
        }
        return result;
    }
}

class PackageItem extends ClasspathItem {
    constructor(classpath: IClasspathNode, project: ClasspathItem, public readonly context: vscode.ExtensionContext) {
        super(classpath, project, context);
        this.iconPath = context.asAbsolutePath('./images/package.png');
    }

    protected loadData(): Thenable<IClasspathNode[]> {
        return vscode.commands.executeCommand(Commands.EXECUTE_WORKSPACE_COMMAND,
            Commands.VIEW_CLASSPATH_FETCH, NodeKind.Classfile,
            [this.project.path, Uri.file(this.path).toString(), this.name]);
    }

    protected createClasspathItemList(): ClasspathItem[] {
        const result = [];
        if (this.classpathNode.children && this.classpathNode.children.length) {
            this.classpathNode.children.forEach((classpathNode) => {
                result.push(new ClassfileItem(classpathNode, this.project, this, this.context));
            });
        }
        return result;
    }
}

class ClassfileItem extends ClasspathItem {
    constructor(classpath: IClasspathNode, project: ClasspathItem, packageItem: ClasspathItem, public readonly context: vscode.ExtensionContext) {
        super(classpath, project, context);
        this.command = {
            title: 'Open .class file',
            command: Commands.VIEW_CLASSPATH_OPEN_FILE,
            arguments: [this.project.path, Uri.file(this.path).toString(), packageItem.name, this.name]
        }
        this.iconPath = context.asAbsolutePath('./images/classfile.png');

    }

    protected loadData(): Thenable<IClasspathNode[]> {
        return null;
    }

    protected createClasspathItemList(): ClasspathItem[] {
        return null;
    }
}
