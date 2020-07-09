/**
 * @fileoverview gRPC-Web generated client stub for chat
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!


/* eslint-disable */
// @ts-nocheck



const grpc = {};
grpc.web = require('grpc-web');


var google_protobuf_timestamp_pb = require('google-protobuf/google/protobuf/timestamp_pb.js')
const proto = {};
proto.chat = require('./chat_pb.js');

/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.chat.ChatServiceClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options['format'] = 'text';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname;

};


/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.chat.ChatServicePromiseClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options['format'] = 'text';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname;

};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.chat.EmptyMessage,
 *   !proto.chat.BroadcastMessage>}
 */
const methodDescriptor_ChatService_Broadcast = new grpc.web.MethodDescriptor(
  '/chat.ChatService/Broadcast',
  grpc.web.MethodType.SERVER_STREAMING,
  proto.chat.EmptyMessage,
  proto.chat.BroadcastMessage,
  /**
   * @param {!proto.chat.EmptyMessage} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.chat.BroadcastMessage.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.chat.EmptyMessage,
 *   !proto.chat.BroadcastMessage>}
 */
const methodInfo_ChatService_Broadcast = new grpc.web.AbstractClientBase.MethodInfo(
  proto.chat.BroadcastMessage,
  /**
   * @param {!proto.chat.EmptyMessage} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.chat.BroadcastMessage.deserializeBinary
);


/**
 * @param {!proto.chat.EmptyMessage} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.chat.BroadcastMessage>}
 *     The XHR Node Readable Stream
 */
proto.chat.ChatServiceClient.prototype.broadcast =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/chat.ChatService/Broadcast',
      request,
      metadata || {},
      methodDescriptor_ChatService_Broadcast);
};


/**
 * @param {!proto.chat.EmptyMessage} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.chat.BroadcastMessage>}
 *     The XHR Node Readable Stream
 */
proto.chat.ChatServicePromiseClient.prototype.broadcast =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/chat.ChatService/Broadcast',
      request,
      metadata || {},
      methodDescriptor_ChatService_Broadcast);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.chat.NewMessageRequest,
 *   !proto.chat.NewMessageResponse>}
 */
const methodDescriptor_ChatService_AddMessage = new grpc.web.MethodDescriptor(
  '/chat.ChatService/AddMessage',
  grpc.web.MethodType.UNARY,
  proto.chat.NewMessageRequest,
  proto.chat.NewMessageResponse,
  /**
   * @param {!proto.chat.NewMessageRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.chat.NewMessageResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.chat.NewMessageRequest,
 *   !proto.chat.NewMessageResponse>}
 */
const methodInfo_ChatService_AddMessage = new grpc.web.AbstractClientBase.MethodInfo(
  proto.chat.NewMessageResponse,
  /**
   * @param {!proto.chat.NewMessageRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.chat.NewMessageResponse.deserializeBinary
);


/**
 * @param {!proto.chat.NewMessageRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.chat.NewMessageResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.chat.NewMessageResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.chat.ChatServiceClient.prototype.addMessage =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/chat.ChatService/AddMessage',
      request,
      metadata || {},
      methodDescriptor_ChatService_AddMessage,
      callback);
};


/**
 * @param {!proto.chat.NewMessageRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.chat.NewMessageResponse>}
 *     A native promise that resolves to the response
 */
proto.chat.ChatServicePromiseClient.prototype.addMessage =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/chat.ChatService/AddMessage',
      request,
      metadata || {},
      methodDescriptor_ChatService_AddMessage);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.chat.NewChannelRequest,
 *   !proto.chat.EmptyMessage>}
 */
const methodDescriptor_ChatService_AddChannel = new grpc.web.MethodDescriptor(
  '/chat.ChatService/AddChannel',
  grpc.web.MethodType.UNARY,
  proto.chat.NewChannelRequest,
  proto.chat.EmptyMessage,
  /**
   * @param {!proto.chat.NewChannelRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.chat.EmptyMessage.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.chat.NewChannelRequest,
 *   !proto.chat.EmptyMessage>}
 */
const methodInfo_ChatService_AddChannel = new grpc.web.AbstractClientBase.MethodInfo(
  proto.chat.EmptyMessage,
  /**
   * @param {!proto.chat.NewChannelRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.chat.EmptyMessage.deserializeBinary
);


/**
 * @param {!proto.chat.NewChannelRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.chat.EmptyMessage)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.chat.EmptyMessage>|undefined}
 *     The XHR Node Readable Stream
 */
proto.chat.ChatServiceClient.prototype.addChannel =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/chat.ChatService/AddChannel',
      request,
      metadata || {},
      methodDescriptor_ChatService_AddChannel,
      callback);
};


/**
 * @param {!proto.chat.NewChannelRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.chat.EmptyMessage>}
 *     A native promise that resolves to the response
 */
proto.chat.ChatServicePromiseClient.prototype.addChannel =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/chat.ChatService/AddChannel',
      request,
      metadata || {},
      methodDescriptor_ChatService_AddChannel);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.chat.EditMessageRequest,
 *   !proto.chat.EmptyMessage>}
 */
const methodDescriptor_ChatService_EditMessage = new grpc.web.MethodDescriptor(
  '/chat.ChatService/EditMessage',
  grpc.web.MethodType.UNARY,
  proto.chat.EditMessageRequest,
  proto.chat.EmptyMessage,
  /**
   * @param {!proto.chat.EditMessageRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.chat.EmptyMessage.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.chat.EditMessageRequest,
 *   !proto.chat.EmptyMessage>}
 */
const methodInfo_ChatService_EditMessage = new grpc.web.AbstractClientBase.MethodInfo(
  proto.chat.EmptyMessage,
  /**
   * @param {!proto.chat.EditMessageRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.chat.EmptyMessage.deserializeBinary
);


/**
 * @param {!proto.chat.EditMessageRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.chat.EmptyMessage)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.chat.EmptyMessage>|undefined}
 *     The XHR Node Readable Stream
 */
proto.chat.ChatServiceClient.prototype.editMessage =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/chat.ChatService/EditMessage',
      request,
      metadata || {},
      methodDescriptor_ChatService_EditMessage,
      callback);
};


/**
 * @param {!proto.chat.EditMessageRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.chat.EmptyMessage>}
 *     A native promise that resolves to the response
 */
proto.chat.ChatServicePromiseClient.prototype.editMessage =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/chat.ChatService/EditMessage',
      request,
      metadata || {},
      methodDescriptor_ChatService_EditMessage);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.chat.EditChannelRequest,
 *   !proto.chat.EmptyMessage>}
 */
const methodDescriptor_ChatService_EditChannel = new grpc.web.MethodDescriptor(
  '/chat.ChatService/EditChannel',
  grpc.web.MethodType.UNARY,
  proto.chat.EditChannelRequest,
  proto.chat.EmptyMessage,
  /**
   * @param {!proto.chat.EditChannelRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.chat.EmptyMessage.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.chat.EditChannelRequest,
 *   !proto.chat.EmptyMessage>}
 */
const methodInfo_ChatService_EditChannel = new grpc.web.AbstractClientBase.MethodInfo(
  proto.chat.EmptyMessage,
  /**
   * @param {!proto.chat.EditChannelRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.chat.EmptyMessage.deserializeBinary
);


/**
 * @param {!proto.chat.EditChannelRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.chat.EmptyMessage)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.chat.EmptyMessage>|undefined}
 *     The XHR Node Readable Stream
 */
proto.chat.ChatServiceClient.prototype.editChannel =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/chat.ChatService/EditChannel',
      request,
      metadata || {},
      methodDescriptor_ChatService_EditChannel,
      callback);
};


/**
 * @param {!proto.chat.EditChannelRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.chat.EmptyMessage>}
 *     A native promise that resolves to the response
 */
proto.chat.ChatServicePromiseClient.prototype.editChannel =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/chat.ChatService/EditChannel',
      request,
      metadata || {},
      methodDescriptor_ChatService_EditChannel);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.chat.EmptyMessage,
 *   !proto.chat.GetChannelsResponse>}
 */
const methodDescriptor_ChatService_GetChannels = new grpc.web.MethodDescriptor(
  '/chat.ChatService/GetChannels',
  grpc.web.MethodType.UNARY,
  proto.chat.EmptyMessage,
  proto.chat.GetChannelsResponse,
  /**
   * @param {!proto.chat.EmptyMessage} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.chat.GetChannelsResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.chat.EmptyMessage,
 *   !proto.chat.GetChannelsResponse>}
 */
const methodInfo_ChatService_GetChannels = new grpc.web.AbstractClientBase.MethodInfo(
  proto.chat.GetChannelsResponse,
  /**
   * @param {!proto.chat.EmptyMessage} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.chat.GetChannelsResponse.deserializeBinary
);


/**
 * @param {!proto.chat.EmptyMessage} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.chat.GetChannelsResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.chat.GetChannelsResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.chat.ChatServiceClient.prototype.getChannels =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/chat.ChatService/GetChannels',
      request,
      metadata || {},
      methodDescriptor_ChatService_GetChannels,
      callback);
};


/**
 * @param {!proto.chat.EmptyMessage} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.chat.GetChannelsResponse>}
 *     A native promise that resolves to the response
 */
proto.chat.ChatServicePromiseClient.prototype.getChannels =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/chat.ChatService/GetChannels',
      request,
      metadata || {},
      methodDescriptor_ChatService_GetChannels);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.chat.EmptyMessage,
 *   !proto.chat.GetUsersResponse>}
 */
const methodDescriptor_ChatService_GetUsers = new grpc.web.MethodDescriptor(
  '/chat.ChatService/GetUsers',
  grpc.web.MethodType.UNARY,
  proto.chat.EmptyMessage,
  proto.chat.GetUsersResponse,
  /**
   * @param {!proto.chat.EmptyMessage} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.chat.GetUsersResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.chat.EmptyMessage,
 *   !proto.chat.GetUsersResponse>}
 */
const methodInfo_ChatService_GetUsers = new grpc.web.AbstractClientBase.MethodInfo(
  proto.chat.GetUsersResponse,
  /**
   * @param {!proto.chat.EmptyMessage} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.chat.GetUsersResponse.deserializeBinary
);


/**
 * @param {!proto.chat.EmptyMessage} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.chat.GetUsersResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.chat.GetUsersResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.chat.ChatServiceClient.prototype.getUsers =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/chat.ChatService/GetUsers',
      request,
      metadata || {},
      methodDescriptor_ChatService_GetUsers,
      callback);
};


/**
 * @param {!proto.chat.EmptyMessage} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.chat.GetUsersResponse>}
 *     A native promise that resolves to the response
 */
proto.chat.ChatServicePromiseClient.prototype.getUsers =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/chat.ChatService/GetUsers',
      request,
      metadata || {},
      methodDescriptor_ChatService_GetUsers);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.chat.GetMessagesRequest,
 *   !proto.chat.GetMessagesResponse>}
 */
const methodDescriptor_ChatService_GetMessages = new grpc.web.MethodDescriptor(
  '/chat.ChatService/GetMessages',
  grpc.web.MethodType.UNARY,
  proto.chat.GetMessagesRequest,
  proto.chat.GetMessagesResponse,
  /**
   * @param {!proto.chat.GetMessagesRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.chat.GetMessagesResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.chat.GetMessagesRequest,
 *   !proto.chat.GetMessagesResponse>}
 */
const methodInfo_ChatService_GetMessages = new grpc.web.AbstractClientBase.MethodInfo(
  proto.chat.GetMessagesResponse,
  /**
   * @param {!proto.chat.GetMessagesRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.chat.GetMessagesResponse.deserializeBinary
);


/**
 * @param {!proto.chat.GetMessagesRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.chat.GetMessagesResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.chat.GetMessagesResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.chat.ChatServiceClient.prototype.getMessages =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/chat.ChatService/GetMessages',
      request,
      metadata || {},
      methodDescriptor_ChatService_GetMessages,
      callback);
};


/**
 * @param {!proto.chat.GetMessagesRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.chat.GetMessagesResponse>}
 *     A native promise that resolves to the response
 */
proto.chat.ChatServicePromiseClient.prototype.getMessages =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/chat.ChatService/GetMessages',
      request,
      metadata || {},
      methodDescriptor_ChatService_GetMessages);
};


module.exports = proto.chat;

