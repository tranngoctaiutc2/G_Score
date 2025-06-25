from django.db import models

class ExamResult(models.Model):
    candidate_id = models.CharField(max_length=20, unique=True)  # sbd
    math = models.FloatField(null=True, blank=True)
    literature = models.FloatField(null=True, blank=True)        # ngu_van
    foreign_language = models.FloatField(null=True, blank=True)  # ngoai_ngu
    physics = models.FloatField(null=True, blank=True)           # vat_li
    chemistry = models.FloatField(null=True, blank=True)         # hoa_hoc
    biology = models.FloatField(null=True, blank=True)           # sinh_hoc
    history = models.FloatField(null=True, blank=True)           # lich_su
    geography = models.FloatField(null=True, blank=True)         # dia_li
    civic_education = models.FloatField(null=True, blank=True)   # gdcd
    foreign_language_code = models.CharField(max_length=5, null=True, blank=True)  # ma_ngoai_ngu

    def __str__(self):
        return self.candidate_id

