from django.shortcuts import render
from django.http import JsonResponse
from django.contrib import messages
from django.contrib.auth import login
from django.views.decorators.http import require_POST
from django.utils.crypto import get_random_string
from .forms import UserProfileForm

# KPIs عامة
COUNTERS = {"hours_saved": 40, "conversion_boost": 25, "cost_reduction": 60}

# فوائد عامة
BENEFITS = [
    {"icon": "⏱️", "title": "More Time for Growth",
     "text": "Automate repetitive work so teams can focus on what truly matters."},
    {"icon": "📈", "title": "Higher Lead Conversion",
     "text": "Respond instantly across channels to engage more prospects."},
    {"icon": "🎯", "title": "Consistent Quality",
     "text": "24/7 availability with on-brand, accurate answers and smart handoff."},
]

def home(request):
    return render(request, "homepage/homepage.html", {
        "counters": COUNTERS, "benefits": BENEFITS
    })

def about(request):
    values = [
        {"icon": "💡", "title": "Innovation First",
         "text": "We push what’s possible with AI to deliver practical, cutting-edge outcomes."},
        {"icon": "🤝", "title": "Client Success",
         "text": "Your goals drive our roadmap. We tailor solutions that create real value."},
        {"icon": "🌍", "title": "Global Perspective",
         "text": "Local understanding + global best practices to fit your unique context."},
    ]
    vision_points = [
        {"icon": "⚖️", "title": "Trust", "text": "Controls, auditability, privacy-first deployments."},
        {"icon": "⚡", "title": "Speed", "text": "Low-latency experiences and fast activation."},
        {"icon": "📊", "title": "Impact", "text": "Shorter queues, happier customers, and lower costs."},
    ]
    return render(request, "about/about.html", {
        "values": values, "vision_points": vision_points
    })

@require_POST
def book_demo(request):
    """
    استلام بيانات الحجز بدون طلب كلمة مرور من المستخدم.
    إذا لم تُرسل كلمة مرور، ننشئ كلمة عشوائية ونمررها للفورم حتى يحفظ المستخدم.
    """
    data = request.POST.copy()

    # إذا لم تصل كلمة مرور من الواجهة (المودال لا يعرضها للمستخدم):
    if not data.get("password1") or not data.get("password2"):
        rnd = get_random_string(16)
        data["password1"] = rnd
        data["password2"] = rnd

    form = UserProfileForm(data)
    if form.is_valid():
        user = form.save()
        login(request, user)
        messages.success(request, "Thanks! We’ll reach out to schedule your free demo.")
        return JsonResponse({"ok": True, "redirect": "/"})

    # ترتيب الأخطاء بشكل JSON مناسب للواجهة
    errs_dict = {field: [str(e) for e in errors]
                 for field, errors in form.errors.items()}
    non_field = form.non_field_errors()
    if non_field:
        errs_dict["non_field_errors"] = [str(e) for e in non_field]

    # رسالة مجمّعة تعرض داخل div[data-err="form"] في الواجهة
    all_msgs = []
    for field_errors in form.errors.values():
        all_msgs.extend([str(e) for e in field_errors])
    if non_field:
        all_msgs.extend([str(e) for e in non_field])
    errs_dict["form"] = " ".join(all_msgs) if all_msgs else "Invalid data."

    return JsonResponse({"ok": False, "errors": errs_dict}, status=400)
