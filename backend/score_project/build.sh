#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt

curl -L -o exam_data.json "https://www.dropbox.com/scl/fi/jg1zjq4sukne1ivqgan74/exam_data.json?rlkey=efhyao4hzle1okq313w5svo8d&st=7p1ejlys&dl=1"

python manage.py collectstatic --no-input
python manage.py migrate
python manage.py loaddata exam_data.json
