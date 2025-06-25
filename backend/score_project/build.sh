#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt

curl -L -o exam_data.json "https://drive.google.com/uc?export=download&id=1XS5bSlvcyWMP4O-62vcV2aSGSXefrPiZ"

python manage.py collectstatic --no-input
python manage.py migrate
python manage.py loaddata exam_data.json
