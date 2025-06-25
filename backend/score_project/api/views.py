from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.management import call_command
from .models import ExamResult
from .serializers import ExamResultSerializer
from django.http import HttpResponse
from openpyxl import Workbook
from django.db.models import Q

SUBJECT_COMBINATIONS = {
    'A00': ['math', 'physics', 'chemistry'],
    'A01': ['math', 'physics', 'foreign_language'],
    'B00': ['math', 'chemistry', 'biology'],
    'C00': ['literature', 'history', 'geography'],
    'D01': ['math', 'literature', 'foreign_language'],
    'D07': ['math', 'chemistry', 'foreign_language'],
    'A02': ['math', 'physics', 'biology'],
    'C01': ['literature', 'math', 'physics'],
    'B08': ['math', 'biology', 'foreign_language'],
}

VIETNAMESE_SUBJECT_NAMES = {
    'math': 'Toán',
    'physics': 'Vật lý',
    'chemistry': 'Hóa học',
    'foreign_language': 'Tiếng Anh',
    'biology': 'Sinh học',
    'literature': 'Ngữ văn',
    'history': 'Lịch sử',
    'geography': 'Địa lý',
    'civic_education': 'GDCD',
    'foreign_language_code': 'Mã NN',
}

ALL_SUBJECTS = [
    'math', 'physics', 'chemistry',
    'literature', 'history', 'geography',
    'foreign_language', 'biology',
    'civic_education', 'foreign_language_code'
]

@api_view(['GET'])
def check_score(request):
    candidate_id = request.GET.get('candidate_id')
    print("[/check/] candidate_id =", candidate_id)

    if not candidate_id:
        print("❌ Thiếu candidate_id")
        return Response({'error': 'Missing candidate_id'}, status=400)

    result = ExamResult.objects.filter(candidate_id=candidate_id).first()
    if not result:
        print("❌ Không tìm thấy thí sinh")
        return Response({'error': 'Student not found'}, status=404)

    print("✅ Tìm thấy:", result)
    serializer = ExamResultSerializer(result)
    return Response(serializer.data)


@api_view(['GET'])
def report_single_subject(request):
    valid_subjects = {
        'math': 'Toán',
        'literature': 'Ngữ Văn',
        'foreign_language': 'Ngoại Ngữ',
        'physics': 'Vật Lý',
        'chemistry': 'Hóa Học',
        'biology': 'Sinh Học',
        'history': 'Lịch Sử',
        'geography': 'Địa Lý',
        'civic_education': 'GDCD'
    }

    subject = request.GET.get('subject', '').strip().lower()
    print("[/report/by-subject/] subject =", subject)

    if subject not in valid_subjects:
        print("❌ Môn học không hợp lệ")
        return Response({'error': 'The subject does not exist'}, status=400)

    scores = ExamResult.objects.values_list(subject, flat=True)
    print(f"✅ Đang xử lý {len(scores)} điểm")

    levels = {'>=8': 0, '6-8': 0, '4-6': 0, '<4': 0}

    for score in scores:
        if score is None:
            continue
        if score >= 8:
            levels['>=8'] += 1
        elif score >= 6:
            levels['6-8'] += 1
        elif score >= 4:
            levels['4-6'] += 1
        else:
            levels['<4'] += 1

    print("✅ Phân bố:", levels)
    return Response({
        'subject': valid_subjects[subject],
        'levels': levels
    })


@api_view(['GET'])
def top_group_dynamic(request):
    group = request.query_params.get('group', 'A00').upper()
    top_n_raw = request.query_params.get('top', 10)
    print("[/top/] group =", group, "| top =", top_n_raw)

    try:
        top_n = int(top_n_raw)
    except ValueError:
        print("❌ Tham số top không hợp lệ")
        return Response({'error': 'Tham số top không hợp lệ'}, status=400)

    if group not in SUBJECT_COMBINATIONS:
        print("❌ Nhóm không hợp lệ")
        return Response({'error': 'Khối không hợp lệ'}, status=400)

    subjects = SUBJECT_COMBINATIONS[group]
    subject_filters = {f"{subj}__isnull": False for subj in subjects}
    students = ExamResult.objects.filter(**subject_filters)
    print(f"✅ Có {students.count()} thí sinh đủ điểm khối {group}")

    ranked = []
    for s in students:
        try:
            total = round(sum([getattr(s, subj) for subj in subjects]), 2)
            ranked.append({
                'candidate_id': s.candidate_id,
                'total_score': total,
                **{subj: getattr(s, subj) for subj in subjects}
            })
        except TypeError:
            print(f"⚠️ Thiếu điểm ở thí sinh {s.candidate_id}, bỏ qua")

    top_students = sorted(ranked, key=lambda x: x['total_score'], reverse=True)[:top_n]
    print(f"✅ Trả về top {len(top_students)} thí sinh")
    return Response(top_students)


@api_view(['GET'])
def export_excel(request):
    group = request.GET.get('group')
    top_n = request.GET.get('top')
    ids_raw = request.GET.getlist('ids')
    ids = []
    for i in ids_raw:
        ids += [s.strip() for s in i.split(',') if s.strip()]

    if group:
        group = group.upper()
        if group not in SUBJECT_COMBINATIONS:
            return Response({'error': 'Khối không hợp lệ'}, status=400)
        subjects = SUBJECT_COMBINATIONS[group]
        subject_filters = {f"{s}__isnull": False for s in subjects}
        subject_label = f"Tổng điểm {group}"
        sheet_title = f"Top_{top_n or 'N'}_{group}"
        filename = f"diem_thi_{group}.xlsx"
    else:
        subjects = []
        subject_filters = {}
        subject_label = "Tổng điểm"
        sheet_title = "Theo_SBD"
        filename = "diem_thi_theo_SBD.xlsx"

    top_results = []
    if group and top_n:
        try:
            top_n = int(top_n)
            students_top = ExamResult.objects.filter(**subject_filters)
            for s in students_top:
                total = sum(getattr(s, subj) for subj in subjects)
                top_results.append({
                    'candidate_id': s.candidate_id,
                    'total': round(total, 2),
                    **{subj: getattr(s, subj, '') for subj in ALL_SUBJECTS}
                })
            top_results = sorted(top_results, key=lambda x: x['total'], reverse=True)[:top_n]
        except ValueError:
            return Response({'error': 'Tham số top không hợp lệ'}, status=400)

    extra_results = []
    if ids:
        students_extra = ExamResult.objects.filter(candidate_id__in=ids)
        for s in students_extra:
            total = (
                round(sum(getattr(s, subj) for subj in subjects), 2)
                if subjects and all(getattr(s, subj, None) is not None for subj in subjects)
                else ''
            )
            extra_results.append({
                'candidate_id': s.candidate_id,
                'total': total,
                **{subj: getattr(s, subj, '') for subj in ALL_SUBJECTS}
            })

    combined = {}
    for s in top_results:
        combined[s['candidate_id']] = s
    for s in extra_results:
        if s['candidate_id'] not in combined:
            combined[s['candidate_id']] = s

    final_data = list(combined.values())
    if not final_data:
        return Response({'error': 'Không có dữ liệu phù hợp để xuất'}, status=400)

    wb = Workbook()
    ws = wb.active
    ws.title = sheet_title

    headers = ['SBD'] + [VIETNAMESE_SUBJECT_NAMES.get(subj, subj) for subj in ALL_SUBJECTS] + [subject_label]
    ws.append(headers)

    for s in final_data:
        row = [s['candidate_id']]
        for subj in ALL_SUBJECTS:
            row.append(s.get(subj, ''))
        row.append(s['total'])
        ws.append(row)

    response = HttpResponse(
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    wb.save(response)
    return response

@api_view(['GET'])
def init_data(request):
    try:
        if ExamResult.objects.exists():
            return Response({'message': '❎ Dữ liệu đã tồn tại. Không cần nạp lại.'})

        call_command('loaddata', 'exam_data.json')
        return Response({'message': '✅ Dữ liệu đã được nạp thành công vào PostgreSQL'})

    except Exception as e:
        return Response({'error': str(e)}, status=500)