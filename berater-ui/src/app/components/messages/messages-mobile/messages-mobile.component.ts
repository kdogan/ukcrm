import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Message } from 'src/app/models/message.model';

@Component({
  selector: 'app-messages-mobile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages-mobile.component.html',
  styleUrl: './messages-mobile.component.scss'
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

  onSendMessage() {
    if (this.messageText.trim()) {
      this.sendMessageEvent.emit(this.messageText);
      this.messageText = '';
      this.messageTextChange.emit(this.messageText);
    }
  }

  onMessageTextChange(value: string) {
    this.messageText = value;
    this.messageTextChange.emit(value);
  }

}
