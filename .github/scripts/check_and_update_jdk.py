#!/usr/bin/env python3

import re
import requests
import json
import ast

readme_ver_pattern = r'(?:(?<=Supports code from Java 1\.8 to Java )(\d+)|(?<=JavaSE-)~|(?<=path/to/jdk-)~)'  # After resolving current_jdk, we will replace ~

# Query the Oracle website for the latest JDK version
response = requests.get('http://javadl-esd-secure.oracle.com/update/baseline.version')
latest_jdk = re.search(r'(?P<major>\d+)\.?', response.text)
if latest_jdk is None:
    print('Failed to retrieve latest JDK version')
    exit(1)
latest_jdk = latest_jdk.group('major')
print(f'Latest JDK version: {latest_jdk}')

# Query the vscode-java repo for the current supported JDK version
with open('README.md', 'r') as f: # Open the README.md file in read mode
    readme = f.read() # Read the file content as a string
current_jdk = re.search(readme_ver_pattern, readme) # Search for the JDK version in the string
if current_jdk is None:
    print('Failed to retrieve current JDK version')
    exit(1)
current_jdk = current_jdk.group(1)
print(f'Current supported JDK version: {current_jdk}')

# If the latest JDK version is not the same as the current supported JDK version, check the test status and update the files
if latest_jdk != current_jdk:
    print(f'New JDK version detected: {latest_jdk}')
    # Create a formatted string template from the URI structure
    uri_base = 'https://ci.eclipse.org/ls/job/jdt-ls-master/lastCompletedBuild/testReport/org.eclipse.jdt.ls.core.internal.{package}/{java_class}/{method}/api/python'
    # Define the test URLs to check using the template and list comprehension
    tests = [
        uri_base.format(package='managers', java_class=c, method=m) for c, m in [('EclipseProjectImporterTest', 'testPreviewFeaturesDisabledByDefault'), ('InvisibleProjectImporterTest', 'testPreviewFeaturesEnabledByDefault'), ('MavenProjectImporterTest', f'testJava{latest_jdk}Project')]
    ]

    # Check the test status for each test URL
    all_tests_passed = True
    for i in range(len(tests)):
        response = requests.get(tests[i])
        data = ast.literal_eval(response.text)  # Use ast.literal_eval, because response.json() fails
        try:
            if data['status'] != 'PASSED':
                print(f'Test #{i + 1} failed ({tests[i]})')
                all_tests_passed = False
                break
        except KeyError:
            print(f'Test #{i + 1} not found ({tests[i]})')
            all_tests_passed = False
            break

    # If all tests passed, update the README.md and the package.json files
    if all_tests_passed:
        print('All tests passed')

        # Replace the ~ with current_jdk
        readme_ver_pattern = re.sub('~', current_jdk, readme_ver_pattern)

        # Write this to a file for the create-pull-request workflow
        with open('latest_jdk.txt', 'w') as f:
            f.write(latest_jdk)

        # Replace the current supported JDK version with the latest JDK version
        readme = re.sub(readme_ver_pattern, latest_jdk, readme)

        # Write the updated README.md file
        with open('README.md', 'w') as f:
            f.write(readme)

        # Read the package.json file
        with open('package.json', 'r') as f:
            package = json.load(f)

        # Add the latest JDK version to the java.configuration.runtimes array
        jdks_config = next(filter(lambda e: e['id'] == "java-jdks", package['contributes']['configuration']))
        jdks_config['properties']['java.configuration.runtimes']['items']['properties']['name']['enum'].append(f'JavaSE-{latest_jdk}')

        # Write the updated package.json file
        with open('package.json', 'w') as f:
            json.dump(package, f, indent=2)
    else:
        print('Some tests failed, aborting update')
        exit(1)
else:
    print('No new JDK version detected, nothing to do')
    exit(0)
exit(0)
