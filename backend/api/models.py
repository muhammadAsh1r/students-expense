# api/models.py
from django.contrib.auth.models import User
from django.db import models


class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="student_profile")
    department = models.CharField(max_length=100)
    wallet_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    friends = models.ManyToManyField("self", blank=True, symmetrical=False, related_name="friend_of")

    def __str__(self):
        return self.user.username


class Expense(models.Model):
    payer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="expenses_paid")
    title = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.amount} by {self.payer.username}"


class ExpenseShare(models.Model):
    expense = models.ForeignKey(Expense, on_delete=models.CASCADE, related_name="shares")
    payee = models.ForeignKey(User, on_delete=models.CASCADE, related_name="shares")
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.payee.username} owes {self.amount} for {self.expense.title}"

