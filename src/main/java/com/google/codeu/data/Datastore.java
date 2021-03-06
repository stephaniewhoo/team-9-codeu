/*
 * Copyright 2019 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.google.codeu.data;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.SortDirection;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;

/** Provides access to the data stored in Datastore. */
public class Datastore {

  private DatastoreService datastore;

  public Datastore() {
    datastore = DatastoreServiceFactory.getDatastoreService();
  }

  /** Stores the Message in Datastore. */
  public void storeMessage(Message message) {
    Entity messageEntity;

    if (message.getParentId() != null) {
      Entity parent;
      try {
        parent = datastore.get(KeyFactory.createKey("Message", message.getParentId().toString()));
      } catch (EntityNotFoundException e) {
        System.out.println("Uh oh");
        return;
      }

      messageEntity = new Entity("MessageReply", message.getId().toString(), parent.getKey());
    } else {
      messageEntity = new Entity("Message", message.getId().toString());
    }

    messageEntity.setProperty("user", message.getUser());
    messageEntity.setProperty("text", message.getText());
    messageEntity.setProperty("timestamp", message.getTimestamp());
    messageEntity.setProperty("class", message.getClassName());

    datastore.put(messageEntity);
  }

  /**
   * Helper functions to add messages to a given arr
   *
   * @return null but mutate the array in the param with info
   */
  public void addMessages(List<Message> messages, PreparedQuery results) {
    for (Entity entity : results.asIterable()) {
      try {
        String idString = entity.getKey().getName();
        UUID id = UUID.fromString(idString);
        String user = (String) entity.getProperty("user");
        String text = (String) entity.getProperty("text");
        long timestamp = (long) entity.getProperty("timestamp");
        String className = (String) entity.getProperty("class");

        Message message = new Message(id, user, text, timestamp, null, className);
        messages.add(message);
      } catch (Exception e) {
        System.err.println("Error reading message.");
        System.err.println(entity.toString());
        e.printStackTrace();
      }
    }
  }

  /**
   * Gets messages posted by a specific user.
   *
   * @return a list of messages posted by the user, or empty list if user has
   *         never posted a message. List is sorted by time descending.
   */
  public List<Message> getMessages(String user) {
    List<Message> messages = new ArrayList<>();

    Query query = new Query("Message").setFilter(new Query.FilterPredicate("user", FilterOperator.EQUAL, user))
        .addSort("timestamp", SortDirection.DESCENDING);
    PreparedQuery results = datastore.prepare(query);

    addMessages(messages, results);

    return messages;
  }

  /**
   * Gets replies to a certain message.
   * 
   * @return a list of replies to a message
   */
  public List<Message> getMessageReplies(String messageId) {
    List<Message> replies = new ArrayList<>();

    Key parentKey = KeyFactory.createKey("Message", messageId);
    Query query = new Query("MessageReply").setAncestor(parentKey).addSort("timestamp", SortDirection.ASCENDING);
    PreparedQuery results = datastore.prepare(query);

    addMessages(replies, results);

    return replies;
  }

  /**
   * Gets messages posted by all users.
   *
   * @return a list of messages posted by all users, or empty list if users have
   *         never posted a message. List is sorted by time descending.
   */
  public List<Message> getAllMessages() {
    List<Message> messages = new ArrayList<>();

    Query query = new Query("Message").addSort("timestamp", SortDirection.DESCENDING);
    PreparedQuery results = datastore.prepare(query);

    addMessages(messages, results);
    return messages;
  }

  /** Returns the total number of messages for all users. */
  public int getTotalMessageCount() {
    Query query = new Query("Message");
    PreparedQuery results = datastore.prepare(query);
    return results.countEntities(FetchOptions.Builder.withLimit(1000));
  }

  /**
   * Stores a class
   * 
   * @return true if added, false if class already exists
   */
  public boolean storeClass(String className) {
    // check if class already exists before adding it
    Query query = new Query("Class").setFilter(new Query.FilterPredicate("name", FilterOperator.EQUAL, className));
    PreparedQuery results = datastore.prepare(query);
    if (results.countEntities(FetchOptions.Builder.withLimit(1000)) > 0) {
      return false;
    }
    Entity entity = new Entity("Class");
    entity.setProperty("name", className);
    datastore.put(entity);
    System.out.println("class added");
    return true;
  }

  /**
   * Gets all classes
   * 
   * @return list of classes
   */
  public List<String> getClasses() {
    List<String> classes = new ArrayList<>();
    PreparedQuery results = datastore.prepare(new Query("Class"));
    for (Entity entity : results.asIterable()) {
      classes.add((String) entity.getProperty("name"));
    }
    return classes;
  }

  /**
   * Gets messages for a class
   * 
   * @param className name of classes
   * @return list of messages for that class
   */
  public List<Message> getClassMessages(String className) {
    List<Message> messages = new ArrayList<>();

    Query query = new Query("Message").setFilter(new Query.FilterPredicate("class", FilterOperator.EQUAL, className))
        .addSort("timestamp", SortDirection.DESCENDING);
    PreparedQuery results = datastore.prepare(query);

    addMessages(messages, results);

    return messages;
  }
}
