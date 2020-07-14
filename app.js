/**
		 * Copyright 2015 IBM Corp. All Rights Reserved.
		 *
		 * Licensed under the Apache License, Version 2.0 (the "License");
		 * you may not use this file except in compliance with the License.
		 * You may obtain a copy of the License at
		 *
		 *      http://www.apache.org/licenses/LICENSE-2.0
		 *
		 * Unless required by applicable law or agreed to in writing, software
		 * distributed under the License is distributed on an "AS IS" BASIS,
		 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
		 * See the License for the specific language governing permissions and
		 * limitations under the License.
		 */
		
		'use strict';
		
		var express = require('express'); // app server
		var bodyParser = require('body-parser'); // parser for post requests
		
		const AssistantV1 = require('ibm-watson/assistant/v1');
		const { IamAuthenticator } = require('ibm-watson/auth');

		var app = express();
		
		// Bootstrap application settings
		app.use(express.static('./public')); // load UI from public folder
		app.use(bodyParser.json());
		
		var assistantAPIKey = process.env["ASSISTANT_IAM_API_KEY"];
		var assistantURL = process.env["ASSISTANT_IAM_URL"];
		var assistantVersion = process.env["VERSION"];
		
		console.log("assistantVersion = " + assistantVersion);

		// Create the service wrapper
		const assistant = new AssistantV1({
		  version: assistantVersion,
		
		  authenticator: new IamAuthenticator({
		    apikey: assistantAPIKey,
		  }),
		  url: assistantURL,
		});
		
		// Endpoint to be call from the client side
		//var workspace = null;
		//var destination_bot = null;
		var workspace_id = null;
		app.post('/api/message', function (req, res) {
		  console.log("");
		  
		  
		  // workspace = '5758ad9a-c37c-4894-abf7-9368cbdba4c0 - 6abc5c45-fcdc-42ab-9f39-1d0baf31f09f - 2e1ab090-5f51-465e-97ad-c831ec32898c';
	 
		  // var workspace_id=process.env["WORKSPACE_ID_Agent_Router"];
		  console.log(workspace_id);
		  var workspace = getDestinationBot(req.body.context,workspace_id);
		  console.log("changing workspace id",workspace_id);
		  
		  // let workspace = process.env.["WORKSPACE_ID_Agent_Router"] || '2e1ab090-5f51-465e-97ad-c831ec32898c';	
		  console.log("workspace = " ,workspace);
		  if (!workspace) // || workspace === workspace_id) 
		  {
			  // print the context and id here then we get to know which id is coming here....
		  console.log("This is ! context",context);
		  console.log("This is ! workspaceID",workspace_id);
			
		    return res.json({
				'output': {
     		       'text': 'text is',
		      }
		    });
		  }
		  		  	  
		  var payload = {
    // workspace-id: workspace,
    workspaceId: workspace,
    context: req.body.context || {},
    input: req.body.input || {}
	};
		  
		
		  // Send the input to the assistant service
		  assistant.message(payload, function (err, data) {
		    data = data.result;
			console.log("This is respns ",data);
		    console.log("Message: " + JSON.stringify(payload.input));
		    if (err) {
		      
		      console.log("Error occurred: " + JSON.stringify(err.message))
		      return res.status(err.code || 500).json(err);
		    }
			  return res.json(data);
			  
		    if (isRedirect(data.context)) {
		      // When there is a redirect, get the redirect bot workspace id
		      //payload.workspaceId = getDestinationBot(data.context);
			  payload.workspaceId = getDestinationBot(data.context);
			  console.log("payload",workspaceId);
		      // When there is a redirect, update destination bot in context so it persists along with the conversation
		      payload.context.destination_bot = data.context.destination_bot;
			  console.log("payload",destination_bot);
		      // Where there is redirect, old conversation_id is not needed. Delete it
		      delete payload.context.conversation_id;
		      // For redirect, no user action is needed. Call the redirect bot automatically and send back that response to user
		      assistant.message(payload, function (err, data) {
		        data = data.result;
				console.log("This is resp data",data);
		        if (err) {
		          return res.status(err.code || 500).json(err);
		        }
		        return res.json(updateMessage(payload, data));
		      });
		    } else { // There is no redirect. So send back the response to user for further action
		      return res.json(updateMessage(payload, data));
		    }
		
		  });
		});
		
		// The function checks if the bot response says messages to be redirected
		
		function isRedirect(context) {
		  if (context && context.redirect_to_another_bot) {
		    var isRedirect = context.redirect_to_another_bot;
		  
		    if (isRedirect == true) {
		      return true;
		    } else {
		      return false;
		    }
		  } else {
		    return false;
		  }
		}
		
		// The agent bot decides which bot the request should be redirected to and updates that in context variable.
		// Get workspace_id for redirected bot details so messages can be sent to that bot
		
		function getDestinationBot(context,workspaceId) {
		  var destination_bot = null;
		  // print the context and id here then we get to know which id is coming here....
	    console.log("This is dest-context",context);
		console.log("This is dest-workspace",workspaceId);
		var destination_bot = workspaceId;
		// var destination_bott = context.destination_bot;
		console.log("This dest id",destination_bot);
		  if (context && context.destination_bot) {
		  console.log("This cont dest id",context.destination_bot);
		    // var destination_bott = context.destination_bot;
			var wsId = process.env["WORKSPACE_ID_" + context.destination_bot];
			// console.log(destination_bot);
			console.log(" This is WsId",wsId);
					  }
		 
		    
		  if (!wsId) {
		    console.log(wsId);
		    wsId = process.env["WORKSPACE_ID_Agent_Router"];
			console.log("if !",wsId);
		  }
		
		  if (!destination_bot) {
		     console.log("if !",destination_bot);
		    destination_bot = "Agent_Router";
		  }
		
		  console.log("Message being sent to: " + destination_bot + " bot");
		  console.log(destination_bot);
		  return wsId;
		  console.log("this is retn wsId",wsId);
		}
		/**
		 * Updates the response text using the intent confidence
		 * @param  {Object} input The request to the Assistant service
		 * @param  {Object} response The response from the Assistant service
		 * @return {Object}          The response with the updated message
		 */
		function updateMessage(input, response) {
			console.log("This is upd mesg method result inp",input);
			console.log("This is upd mesg method res ",response);
		  var responseText = null;
		  if (!response.output) {
		    response.output = {};
		  } else {
		    console.log("Response message: " + JSON.stringify(response.output.text));
		    return response;
		  }
		  if (response.intents && response.intents[0]) {
		    var intent = response.intents[0];
		    
		    if (intent.confidence >= 0.75) {
		      responseText = 'I understood your intent was ' + intent.intent;
		    } else if (intent.confidence >= 0.5) {
		      responseText = 'I think your intent was ' + intent.intent;
		    } else {
		      responseText = 'I did not understand your intent';
		    }
		  }
		  response.output.text = responseText;
		  return response;
		}
		
		module.exports = app;

