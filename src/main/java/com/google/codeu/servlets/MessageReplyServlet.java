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

package com.google.codeu.servlets;

import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.codeu.data.Datastore;
import com.google.codeu.data.Message;
import com.google.gson.Gson;
import java.io.IOException;
import java.util.List;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.jsoup.Jsoup;
import org.jsoup.safety.Whitelist;

@WebServlet("/message-reply")
public class MessageReplyServlet extends HttpServlet {

  private Datastore datastore;

  @Override
  public void init() {
    datastore = new Datastore();
  }

  /**
   * Responds with a JSON representation of message reply data for a specific
   * message. Responds with an empty array if the message is not provided.
   */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {

    response.setContentType("application/json");

    String id = request.getParameter("id");

    if (id == null || id.equals("")) {
      // Request is invalid, return empty array
      response.getWriter().println("[]");
      return;
    }

    List<Message> messages = datastore.getMessageReplies(id);
    Gson gson = new Gson();
    String json = gson.toJson(messages);

    response.getWriter().println(json);
  }

  /** Stores a new message reply. */
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    System.out.println("AAAahhhhHHHHHHHH\nAHAHHAHAHAH\nA\na\naaaaaaa");
    UserService userService = UserServiceFactory.getUserService();
    if (!userService.isUserLoggedIn()) {
      response.sendRedirect("/index.html");
      return;
    }

    String user = userService.getCurrentUser().getEmail();

    // since CKEdit input html
    String text = Jsoup.clean(request.getParameter("text"), Whitelist.basicWithImages());

    // replace image urls with html tags
    String regex = "(https?://\\S+\\.(png|jpg))";
    String replacement = "<img src=\"$1\" />";
    String textWithImagesReplaced = text.replaceAll(regex, replacement);

    String messageId = request.getParameter("id");

    Message reply = new Message(user, textWithImagesReplaced, messageId);
    datastore.storeMessage(reply);
    response.sendRedirect("/feed.html");
  }
}
