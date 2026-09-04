const test = require('node:test');
const assert = require('node:assert/strict');

const { ChatService } = require('../dist/modules/chat/chat.service.js');
const { conversations, messages } = require('../dist/modules/chat/chat.repository.js');

function resetState() {
  conversations.length = 0;
  messages.length = 0;
}

test('conversation creation and message persistence are authorized and accessible to members', () => {
  resetState();

  const conversation = ChatService.createConversation('u-1', ['u-2', 'u-3']);
  assert.equal(conversation.type, 'group');
  assert.equal(conversation.memberIds.includes('u-1'), true);

  const sent = ChatService.sendMessage('u-1', conversation.id, 'hello team');
  assert.equal(sent.content, 'hello team');

  const thread = ChatService.getMessages(conversation.id, 'u-2');
  assert.equal(thread.messages.some((message) => message.id === sent.id), true);

  assert.throws(
    () => ChatService.getMessages(conversation.id, 'u-9'),
    (error) => Boolean(error) && error.code === 'CONVERSATION_FORBIDDEN',
  );
});

test('message reads are tracked per user and conversations list include unread counts', () => {
  resetState();

  const conversation = ChatService.createConversation('u-1', ['u-2']);
  const first = ChatService.sendMessage('u-2', conversation.id, 'hi');
  const second = ChatService.sendMessage('u-2', conversation.id, 'hello');

  const read = ChatService.markMessageRead('u-1', conversation.id, first.id);
  assert.equal(read.readBy.includes('u-1'), true);

  const list = ChatService.listConversations('u-1');
  const item = list.find((entry) => entry.id === conversation.id);
  assert.ok(item);
  assert.equal(item.unreadCount, 1);
  assert.equal(item.lastMessage && item.lastMessage.content, 'hello');

  const thread = ChatService.getMessages(conversation.id, 'u-1');
  assert.equal(thread.messages.some((message) => message.id === second.id), true);
});
