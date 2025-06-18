# Java Clean Ups

Java clean ups are run on the current document whenever it's saved.
They can fix a wide variety of issues, from code style to programming mistakes,
and can even modernize the sources based on new Java language features.
Here is some information on the supported cleanups and the details of what they do.

### `qualifyMembers`

Whenever a member (field or method) of a class is accessed from within the class,
prefix the access with `this`.
This is similar to how Python requires the programmer to access members using `self`.

For instance:

```java
private int value;

public int getValue() {
	return value;
}
```

becomes:

```java
private int value;

public int getValue() {
	return this.value;
}
```

### `qualifyStaticMembers`

Whenever there is a static variable or function, prefix the access with the name of the class that the static variable or function belongs to.

For instance:

```java
import static java.lang.System.out;

public class MyClass {
	public static final double FACTOR = 0.5;

	public double getNumber(double value) {
		out.println("moo");
		return value * FACTOR;
	}
}
```

becomes:

```java
import static java.lang.System.out;

public class MyClass {
	public static final double FACTOR = 0.5;

	public double getNumber(double value) {
		System.out.println("moo");
		return value * MyClass.FACTOR;
	}
}
```

### `addOverride`

When a method of a class that overrides a method from a parent class or provides an implementation for a method from an interface, add the `@Override` annotation.

For example:

```java
public class MyRunner implements Runnable {
	public void run() {
		System.out.println("Hello, World!");
	}
}
```

becomes:

```java
public class MyRunner implements Runnable {
	@Override
	public void run() {
		System.out.println("Hello, World!");
	}
}
```

### `addDeprecated`

When a method is marked `@deprecated` in the Javadoc, but doesn't have the `@Deprecated` annotation, add the `@Deprecated` annotation.
This only works if the compiler has been configured to mark deprecated methods without the deprecated annotation
as an info/warning/error in the JDT settings.

For example:

```java
/**
 * Not used anymore, please stop using.
 *
 * @deprecated
 */
public boolean isAGoat() {
	return false;
}
```

becomes:

```java
/**
 * Not used anymore, please stop using.
 *
 * @deprecated
 */
@Deprecated
public boolean isAGoat() {
	return false;
}
```

### `stringConcatToTextBlock`

Appropriate String concatenations will be converted into Java `Text Blocks`. Appropriate String concatenations must have at least 3 non-empty substrings with one per line and the Java level must be 15 or higher. Line comments for all substrings but the last line will be lost after conversion. Spaces at the end of substrings preceding the newline will result in `\s` being substituted while substrings that do not end with newlines will have a `\` added at the end of the line to preserve concatenation.

For example:

```java
String x = "" +
	"public class A {\n" +
	"    public void m() {\n" +
	"        System.out.println(\"abc\");\n" +
	"    }\n" +
	"}";
```

becomes:

```java
String x = """
	public class A {
		public void m() {
			System.out.println("abc");
		}
	}""";
```

### `invertEquals`

Inverts calls to `Object.equals(Object)` and `String.equalsIgnoreCase(String)` to avoid useless null pointer exception.

The caller must be nullable and the parameter must not be nullable.

By avoiding null pointer exceptions, the behavior may change.

For example:

```java
String message = getMessage();
boolean result1 = message.equals("text");
boolean result2 = message.equalsIgnoreCase("text");
```

becomes:

```java
String message = getMessage();
boolean result1 = "text".equals(message);
boolean result2 = "text".equalsIgnoreCase(message);
```

### `addFinalModifier`

Use the `final` modifier for variable declarations wherever it is possible.

For example:

```java
private int i= 0;
public void foo(int j) {
    int k, h;
    h= 0;
}
```

becomes:

```java
private final int i= 0;
public void foo(final int j) {
    final int k;
    int h;
    h= 0;
}
```

### `instanceofPatternMatch`

Use pattern matching for the `instanceof` operator wherever possible. It is only applicable for Java level 15 or higher.

For example:

```java
if (object instanceof Integer) {
    Integer i = (Integer) object;
    return i.intValue();
}
```

becomes:

```java
if (object instanceof Integer i) {
    return i.intValue();
}
```


### `lambdaExpressionFromAnonymousClass`

Convert anonymous class declarations for functional interfaces to lambda expressions wherever possible. It is only applicable for Java level 8 or above.

For example:

```java
IntConsumer c = new IntConsumer() {
    @Override public void accept(int value) {
        System.out.println(i);
    }
};
```

becomes:

```java
IntConsumer c = i -> {
    System.out.println(i);
};
```

### `switchExpression`

Convert switch statements to switch expressions wherever possible. It is only applicable for Java level 14 or above.

**Note** : _Switch statements that use control statements such as nested switch statements, if/else blocks, for/while loops are not considered as is the case for return/continue statements. All cases of the switch statement must either have a last assignment statement that sets the same variable/field as other cases, or else has a throw statement. Fall-through is allowed between cases but only if there are no other statements in between. The switch statement must have a default case unless the switch expression is an enum type and all possible enum values are represented in the cases._

For example:

```java
int i;
switch(j) {
    case 1:
        i = 3;
        break;
    case 2:
        i = 4;
        break;
    default:
        i = 0;
        break;
}
```

becomes:

```java
int i = switch(j) {
    case 1 -> 3;
    case 2 -> 4;
    default -> 0;
};
```

### `tryWithResource`

Simplifies the finally block to use the `try-with-resource` statement.

For example:

```java
final FileInputStream inputStream = new FileInputStream("out.txt");
try {
    System.out.println(inputStream.read());
} finally {
    inputStream.close();
}
```

becomes:

```java
final FileInputStream inputStream = new FileInputStream("out.txt");
try (inputStream) {
    System.out.println(inputStream.read());
}
```

### `lambdaExpression`

Cleans up lambda expression wherever possible in the following ways:

1. Removes unnecessary parentheses.

    For example:

    ```java
    (someString) -> someString.trim().toLowerCase();
    ```

    becomes:

    ```java
    someString -> someString.trim().toLowerCase();
    ```

2. Converts lambda expression blocks to a single statement when possible.

    For example:

    ```java
    someString -> {return someString.trim().toLowerCase();};
    ```

    becomes:

    ```java
    someString -> someString.trim().toLowerCase();
    ```

3. Converts lambda expression to method reference.

    For example:

    ```java
    () -> new ArrayList<>();
    ```

    becomes:

    ```java
    ArrayList::new;
    ```

### `organizeImports`

Performs the "Organize Imports" operation.

**Note** : Since clean ups are meant to be applied without user feedback (eg. prompts about ambiguous types), this may leave some types unresolved. To properly resolve these ambiguous types, one can do so manually (code actions, source actions), or by calling "Organize Imports" through the command palette / key binding (<kbd>shift</kbd> + <kbd>alt</kbd> + <kbd>o</kbd>).

For example:

```java
package test1;
public class A {
    public void test() {
        List<String> a1;
        Iterator<String> a2;
        Map<String, String> a3;
        Set<String> a4;
        JarFile a5;
        StringTokenizer a6;
        Path a7;
        URI a8;
        HttpURLConnection a9;
        InputStream a10;
        Field a11;
        Parser a12;
    }
}
```

becomes:

```java
package test1;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.nio.file.Path;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.StringTokenizer;
import java.util.jar.JarFile;

public class A {
    public void test() {
        List<String> a1;
        Iterator<String> a2;
        Map<String, String> a3;
        Set<String> a4;
        JarFile a5;
        StringTokenizer a6;
        Path a7;
        URI a8;
        HttpURLConnection a9;
        InputStream a10;
        Field a11;
        Parser a12;
    }
}
```

### `renameUnusedLocalVariables`

Rename unused loop variables, try-with-resource variables, catch parameters, lambda parameters, pattern variables to `_`.

For example:

```java
J j = (a, b) -> System.out.println(a);

switch (r) {
    case R(_, long l) -> {}
    case R r2 -> {}
}
```

becomes:

```java
J j = (a, _) -> System.out.println(a);

switch (r) {
    case R(_, _) -> {}
    case R _ -> {}
}
```

### `useSwitchForInstanceofPattern`

Convert if/else chains to pattern matching switch statements.

For example:

```java
int i, j;
double d;
boolean b;
if (x instanceof Integer xint) {
    i = xint.intValue();
} else if (x instanceof Double xdouble) {
    d = xdouble.doubleValue();
} else if (x instanceof Boolean xboolean) {
    b = xboolean.booleanValue();
} else {
    i = 0;
    d = 0.0D;
    b = false;
}
```

becomes:

```java
int i, j;
double d;
boolean b;
switch (x) {
    case Integer xint -> i = xint.intValue();
    case Double xdouble -> d = xdouble.doubleValue();
    case Boolean xboolean -> b = xboolean.booleanValue();
    case null, default -> {
        i = 0;
        d = 0.0D;
        b = false;
    }
}
```

### `redundantComparisonStatement`

Remove redundant comparison statement.

For example:

```java
if (i != 123) {
    return i;
} else {
    return 123;
}
```

becomes:

```java
return i;
```

### `redundantFallingThroughBlockEnd`

Remove redundant end of block with jump statement.

For example:

```java
if (0 < i) {
    System.out.println("Doing something");
    return i + 10;
}
return i + 10;
```

becomes:

```java
if (0 < i) {
    System.out.println("Doing something");
}
return i + 10;
```

### `redundantIfCondition`

Remove redundant if condition.

For example:

```java
if (isValid) {
    return 0;
} else if (!isValid) {
    return -1;
}
```

becomes:

```java
if (isValid) {
    return 0;
} else {
    return -1;
}
```

### `redundantModifiers`

Remove redundant modifiers.

For example:

```java
public abstract interface IFoo {
    public static final int MAGIC_NUMBER = 646;
    public abstract int foo ();
    public int bar (int bazz);
}
```

becomes:

```java
public interface IFoo {
    int MAGIC_NUMBER = 646;
    int foo ();
    int bar (int bazz);
}
```

### `redundantSuperCall`

Remove redundant `super()` class in constructor.

For example:

```java
MyClass() {
    super();
}
```

becomes:

```java
MyClass() {
}
```
