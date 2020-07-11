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
		// var workspace = null;
		// var destination_bot = null;
		// var workspace_id = null;
		app.post('/api/message', function (req, res) {
		  console.log("");
		  
		  
		  // workspace = '5758ad9a-c37c-4894-abf7-9368cbdba4c0 - 6abc5c45-fcdc-42ab-9f39-1d0baf31f09f - 2e1ab090-5f51-465e-97ad-c831ec32898c';
		//  Logical Operator	Description	
// &&	and	(x < 10 && y > 1) is true	
// ||	or	(x == 5 || y == 5) is false	
// !	not	!(x == y) is true
		  
		  // Operator	Description	Example	Try it
// &&	and	(x < 10 && y > 1) is true	
// ||	or	(x == 5 || y == 5) is false	
// !	not	!(x == y) is true
		 
// Comparision Operator	Description	
// ==	equal to	x == 8	false	
// x == 5	true	
// x == "5"	true	
// ===	equal value and equal type	x === 5	true	
// x === "5"	false	
// !=	not equal	x != 8	true	
// !==	not equal value or not equal type	x !== 5	false	
// x !== "5"	true	
// x !== 8	true		 
		  workspace_id = process.env["WORKSPACE_ID_Agent_Router"];
		  var workspace = getDestinationBot(req.body.context) || workspace_id
		  console.log(workspace_id);
		  // let workspace = process.env.["WORKSPACE_ID_Agent_Router"] || '2e1ab090-5f51-465e-97ad-c831ec32898c';	
		  console.log("workspace = " + workspace);
		  if (!workspace || workspace === workspace_id) {
			  console.log(workspace);
			  // console.log(workspaceId);
			  console.log(workspace_id);
			  console.log("WORKSPACE_ID_Bluepages_Skills");
		    return res.json({
				'output': {
     		       'text': 'text',
		      },
		    });
		  }
		  
		  var textIn = '';
		  
		  if (req.body.input) {
			  textIn = req.body.input.text;
		  }
		  
		  var payload = {
    // workspace_id: workspace,
    workspaceId: workspace,
    context: req.body.context || {},
    input: req.body.input || {}
	// console.log(workspaceId);
	// console.log(workspace);
  };
		  /* var payload = {
		    // workspaceId: workspaceId,
		    context: req.body.context || {},
			// sessionId: req.body.session_id,
		    input: {
				message_type: 'text',
				text: textIn,
			}
		  	  
		   }; */
		
		  // Send the input to the assistant service
		  assistant.message(payload, function (err, data) {
		    data = data.result
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
			  console.log(workspaceId);
		      // When there is a redirect, update destination bot in context so it persists along with the conversation
		      payload.context.destination_bot = data.context.destination_bot;
			  console.log(destination_bot);
		      // Where there is redirect, old conversation_id is not needed. Delete it
		      delete payload.context.conversation_id;
		      // For redirect, no user action is needed. Call the redirect bot automatically and send back that response to user
		      assistant.message(payload, function (err, data) {
		        data = data.result
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
		
		
		
	/* 	Use the switch statement to select one of many code blocks to be executed.

Syntax
switch(expression) {
  case x:
    // code block
    break;
  case y:
    // code block
    break;
  default:
    // code block
} */

function getDestinationBot(context) {
  var destination_bot = null;
  if (context && context.destination_bot) {
    destination_bot = context.destination_bot.toUpperCase();
  }

  var wsId = process.env["WORKSPACE_ID_" + destination_bot];

  if (!wsId) {
    wsId = process.env["WORKSPACE_ID_Agent_Router"];
  }

  if (!destination_bot) {
    destination_bot = "Agent_Router";
  }

  console.log("Message being sent to: " + destination_bot + " bot");
  return wsId;
}







		/* function getDestinationBot(context){
  if( context && context.destination_bot && context.destination_bot.toUpperCase() === "Bluepages_Skills" ){
    return process.env.WORKSPACE_ID_Bluepages_Skills;
  }else if( context && context.destination_bot && context.destination_bot.toUpperCase() === "Resiliency_Skills" ){
    return process.env.WORKSPACE_ID_Resiliency_Skills;
  }else{
    return process.env.WORKSPACE_ID_Agent_Router;
  }
} */
		/**
		 * Updates the response text using the intent confidence
		 * @param  {Object} input The request to the Assistant service
		 * @param  {Object} response The response from the Assistant service
		 * @return {Object}          The response with the updated message
		 */
		function updateMessage(input, response) {
		  var responseText = null;
		  if (!response.output) {
		    response.output = {};
		  } else {
		    console.log("Response message: " + JSON.stringify(response.output.text));
		    return response;
		  }
		  if (response.intents && response.intents[0]) {
		    var intent = response.intents[0];
		    // Depending on the confidence of the response the app can return different messages.
		    // The confidence will vary depending on how well the system is trained. The service will always try to assign
		    // a class/intent to the input. If the confidence is low, then it suggests the service is unsure of the
		    // user's intent . In these cases it is usually best to return a disambiguation message
		    // ('I did not understand your intent, please rephrase your question', etc..)
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

