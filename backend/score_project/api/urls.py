from django.urls import path
from . import views

urlpatterns = [
    path('check/', views.check_score),
    path('report/by-subject/', views.report_single_subject),
    path('top/', views.top_group_dynamic),
    path('export-excel/', views.export_excel),
    path('init-data/', views.init_data),
]
