from django.contrib.auth.models import User
from django.db import models


class Member(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="member",
    )
    username = models.CharField(
        max_length=150,
        help_text="Cached username for convenience, mirrors auth.User.username.",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Member"
        verbose_name_plural = "Members"

    def __str__(self) -> str:  # type: ignore[override]
        return self.username


class Message(models.Model):
    member = models.ForeignKey(
        Member,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
        verbose_name = "Message"
        verbose_name_plural = "Messages"

    def __str__(self) -> str:  # type: ignore[override]
        preview_length = 50
        text_preview = self.text
        if len(text_preview) > preview_length:
            text_preview = f"{text_preview[:preview_length]}..."
        return f"{self.member.username}: {text_preview}"
