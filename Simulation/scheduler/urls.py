from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("prefilled/<str:name>/<int:type>", views.prefilled_scheduler, name="prefilled")
]