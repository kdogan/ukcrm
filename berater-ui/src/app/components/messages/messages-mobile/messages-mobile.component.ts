import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Message } from 'src/app/models/message.model';

@Component({
    selector: 'app-messages-mobile',
    imports: [CommonModule, FormsModule],
    templateUrl: './messages-mobile.component.html',
    styleUrl: './messages-mobile.component.scss',
    standalone:true
})
export class MessagesMobileComponent {

  @Input() messages: Message[] = [];
  @Input() conversations: any[] = [];
  @Input() selectedConversation: any;
  @Input() users: { _id: string; name: string; address?: string }[] = [];
  @Input() currentUserId!: string;
  @Input() messageText = '';
  @Input() showUserPicker = false;

  @Output() sendMessageEvent = new EventEmitter<string>();
  @Output() selectConversationEvent = new EventEmitter<any>();
  @Output() startConversationEvent = new EventEmitter<string>();
  @Output() messageTextChange = new EventEmitter<string>();
  @Output() toggleUserPickerEvent = new EventEmitter<void>();

  @ViewChild('messageTextarea') messageTextarea!: ElementRef<HTMLTextAreaElement>;

  onSendMessage() {
    if (this.messageText.trim()) {
      this.sendMessageEvent.emit(this.messageText);
      this.messageText = '';
      this.messageTextChange.emit(this.messageText);

      // Textarea-Höhe zurücksetzen
      if (this.messageTextarea) {
        this.messageTextarea.nativeElement.style.height = '44px';
      }
    }
  }

  onMessageTextChange(value: string) {
    this.messageText = value;
    this.messageTextChange.emit(value);
  }

  onEnterPress(event: KeyboardEvent) {
    // Shift+Enter = neue Zeile (Standard-Verhalten)
    // Enter allein = Nachricht senden
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSendMessage();
    }
  }

  autoResize(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }

}
