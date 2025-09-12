from django.contrib.auth.models import User
from django.db import models
from django.db.models import Q


class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="student_profile")
    department = models.CharField(max_length=100)
    wallet_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    friends = models.ManyToManyField("self", blank=True, symmetrical=False, related_name="friend_of")

    def __str__(self):
        return self.user.username


class Expense(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="expenses")
    title = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True)
    date = models.DateField(auto_now_add=True)
    people = models.ManyToManyField(Student, related_name="shared_expenses", blank=True)  # <-- new field

    def __str__(self):
        return f"{self.title} - {self.amount}"

