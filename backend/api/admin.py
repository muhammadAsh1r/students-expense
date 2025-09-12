from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import Student, Expense

# -------------------------
# Student Inline in UserAdmin
# -------------------------
class StudentInline(admin.StackedInline):
    model = Student
    can_delete = False
    verbose_name_plural = 'Student Info'
    fk_name = 'user'

class UserAdmin(BaseUserAdmin):
    inlines = (StudentInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'get_department', 'get_wallet')
    list_select_related = ('student_profile',)

    def get_department(self, obj):
        return obj.student_profile.department
    get_department.short_description = 'Department'

    def get_wallet(self, obj):
        return obj.student_profile.wallet_balance
    get_wallet.short_description = 'Wallet Balance'

# Unregister default User and register custom UserAdmin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)

# -------------------------
# Student Admin
# -------------------------
@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('user', 'department', 'wallet_balance')
    search_fields = ('user__username', 'user__email', 'department')
    filter_horizontal = ('friends',)  # makes ManyToMany field easier to manage

# -------------------------
# Expense Admin
# -------------------------
@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('title', 'amount', 'student', 'date')
    list_filter = ('date', 'student')
    search_fields = ('title', 'description', 'student__user__username')
    filter_horizontal = ('people',)  # for ManyToMany field
