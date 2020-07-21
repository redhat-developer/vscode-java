package java;

import java.util.HashSet;
import java.util.Set;

import org.apache.commons.lang3.StringUtils;

public class Foo3 {

	private Set<String> properties;

	public Foo3() {
		this.properties = new HashSet<String>();
	}

	public void localVariable() {
		StringUtils util = new StringUtils();
		System.out.println(this.properties);
		System.out.println(util);
	}

	@Override
	public String toString() {
		return "Foo3 [properties=" + properties + "]";
	}
}
