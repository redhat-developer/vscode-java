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

public void getValue() {
	return value;
}
```

becomes:

```java
private int value;

public void getValue() {
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