package com.google.codeu.data;

import java.util.UUID;

/** A reply to a message */
public class MessageReply {

  private UUID parentId;

  public MessageReply(String user, String text, String parentId) {
    this(UUID.randomUUID(), user, text, System.currentTimeMillis(), parentId);
  }

  public MessageReply(UUID id, String user, String text, long timestamp, String parentId) {
    this.parentId = UUID.fromString(parentId);
  }

  public UUID getParentId() {
    return parentId;
  }
}
