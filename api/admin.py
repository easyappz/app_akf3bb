from django.contrib import admin

from .models import Member, Message


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ("id", "username", "user", "created_at")
    search_fields = ("username", "user__username")
    readonly_fields = ("created_at",)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("id", "member", "short_text", "created_at")
    search_fields = ("member__username", "text")
    readonly_fields = ("created_at",)

    def short_text(self, obj: Message) -> str:  # type: ignore[name-defined]
        max_length = 50
        value = obj.text
        if len(value) > max_length:
            return f"{value[:max_length]}..."
        return value

    short_text.short_description = "Text preview"  # type: ignore[attr-defined]
