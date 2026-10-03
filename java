git clone https://github.com/redhat-developer/vscode-java.git
cd vscode-java
git checkout -b remove-package-lock
git rm package-lock.json
git commit -m "chore: remove package-lock.json"
git push -u origin remove-package-lock
