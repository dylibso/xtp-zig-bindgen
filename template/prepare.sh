#!/bin/bash

# Extract the last hex value using grep with a regular expression
# The pattern looks for 0x followed by hexadecimal digits at the end of the string
fingerprint=$(zig build 2>&1 | grep -o '0x[0-9a-f]\+$')
echo "Fingerprint: $fingerprint"
# Replace the fingerprint in the generated code
sed "s/\.fingerprint = 0x0000000000000000,/\.fingerprint = $fingerprint,/" "build.zig.zon" > "build.zig.zon.tmp"
rm "build.zig.zon"
mv "build.zig.zon.tmp" "build.zig.zon"
