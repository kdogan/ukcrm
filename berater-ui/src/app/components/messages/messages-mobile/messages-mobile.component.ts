import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Message } from 'src/app/models/message.model';
import { MessagesService } from 'src/app/services/messages.service';

@Component({
  selector: 'app-messages-mobile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages-mobile.component.html',
  styleUrl: './messages-mobile.component.scss'
})
export class MessagesMobileComponent implements OnInit {

  @Input() conversationId!: string;
  @Input() currentUserId!: string;
  @Input() currentRole: string = 'admin';
  @Input() receiverId!: string;

  messages: Message[] = [];
  messageText = '';

  constructor(private messagesService: MessagesService) {}

  ngOnInit(): void {
    if (!this.conversationId) {
      console.warn('conversationId fehlt');
      return;
    }
    this.loadMessages();
  }

  loadMessages(): void {
    this.messagesService.getMessages(this.conversationId).subscribe({
      next: (msgs) => {
        this.messages = msgs;
        this.scrollToBottom();
      },
      error: (err) => console.error(err)
    });
  }

  sendMessage(): void {
    if (!this.messageText.trim()) return;

    this.messagesService.sendMessage(
      this.conversationId,
      this.receiverId,
      this.messageText
    ).subscribe({
      next: (msg) => {
        this.messages.push(msg);
        this.messageText = '';
        this.scrollToBottom();
      },
      error: (err) => console.error(err)
    });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = document.querySelector('.chat-messages');
      el?.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    });
  }
}
