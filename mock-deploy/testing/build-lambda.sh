#!/usr/bin/env bash
# Run with bash; requires Python 3 with pip and curl. No AWS credentials needed.
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
package_dir="$(mktemp -d)"
trap 'rm -rf -- "$package_dir"' EXIT

# psycopg2 contains native code: use wheels for the Lambda runtime, not the host.
python3 -m pip install \
    --platform manylinux2014_x86_64 \
    --implementation cp \
    --python-version 3.12 \
    --only-binary=:all: \
    --no-compile \
    --target "$package_dir" \
    --requirement "$script_dir/requirements.txt"

cp "$script_dir/testing.py" "$package_dir/testing.py"
cp "$script_dir/schema.sql" "$package_dir/schema.sql"
curl --fail --silent --show-error --location \
    https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem \
    --output "$package_dir/global-bundle.pem"

# The handler, libraries, and CA bundle must be at the root of the archive.
python3 - "$package_dir" "$script_dir/lambda.zip" <<'PY'
from pathlib import Path
import sys
from zipfile import ZIP_DEFLATED, ZipFile

package_dir = Path(sys.argv[1])
with ZipFile(sys.argv[2], "w", compression=ZIP_DEFLATED) as archive:
    for path in sorted(package_dir.rglob("*")):
        if path.is_file():
            archive.write(path, path.relative_to(package_dir))
print(f"Created {sys.argv[2]}")
PY