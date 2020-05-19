'use strict';

export function getJavaRuntimeFromVersion(ver: string) {
    if (ver === "1.5") {
        return "J2SE-1.5";
    }

    return `JavaSE-${ver}`;
}
