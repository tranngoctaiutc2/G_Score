import csv
from django.core.management.base import BaseCommand
from api.models import ExamResult

class Command(BaseCommand):
    help = 'Import exam scores from diem_thi_thpt_2024.csv'

    def handle(self, *args, **kwargs):
        with open('diem_thi_thpt_2024.csv', newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            count = 0
            for row in reader:
                ExamResult.objects.update_or_create(
                    candidate_id=row['sbd'],
                    defaults={
                        'math': row['toan'] or None,
                        'literature': row['ngu_van'] or None,
                        'foreign_language': row['ngoai_ngu'] or None,
                        'physics': row['vat_li'] or None,
                        'chemistry': row['hoa_hoc'] or None,
                        'biology': row['sinh_hoc'] or None,
                        'history': row['lich_su'] or None,
                        'geography': row['dia_li'] or None,
                        'civic_education': row['gdcd'] or None,
                        'foreign_language_code': row['ma_ngoai_ngu'] or None,
                    }
                )
                count += 1
                if count % 10000 == 0:
                    self.stdout.write(f'Imported {count} records...')

            self.stdout.write(self.style.SUCCESS(f'Imported {count} records successfully.'))
