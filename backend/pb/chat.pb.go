// Code generated by protoc-gen-go. DO NOT EDIT.
// source: chat.proto

package chat

import (
	context "context"
	fmt "fmt"
	proto "github.com/golang/protobuf/proto"
	timestamp "github.com/golang/protobuf/ptypes/timestamp"
	grpc "google.golang.org/grpc"
	codes "google.golang.org/grpc/codes"
	status "google.golang.org/grpc/status"
	math "math"
)

// Reference imports to suppress errors if they are not otherwise used.
var _ = proto.Marshal
var _ = fmt.Errorf
var _ = math.Inf

// This is a compile-time assertion to ensure that this generated file
// is compatible with the proto package it is being compiled against.
// A compilation error at this line likely means your copy of the
// proto package needs to be updated.
const _ = proto.ProtoPackageIsVersion3 // please upgrade the proto package

type ConnectRequest struct {
	User                 string   `protobuf:"bytes,1,opt,name=user,proto3" json:"user,omitempty"`
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *ConnectRequest) Reset()         { *m = ConnectRequest{} }
func (m *ConnectRequest) String() string { return proto.CompactTextString(m) }
func (*ConnectRequest) ProtoMessage()    {}
func (*ConnectRequest) Descriptor() ([]byte, []int) {
	return fileDescriptor_8c585a45e2093e54, []int{0}
}

func (m *ConnectRequest) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_ConnectRequest.Unmarshal(m, b)
}
func (m *ConnectRequest) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_ConnectRequest.Marshal(b, m, deterministic)
}
func (m *ConnectRequest) XXX_Merge(src proto.Message) {
	xxx_messageInfo_ConnectRequest.Merge(m, src)
}
func (m *ConnectRequest) XXX_Size() int {
	return xxx_messageInfo_ConnectRequest.Size(m)
}
func (m *ConnectRequest) XXX_DiscardUnknown() {
	xxx_messageInfo_ConnectRequest.DiscardUnknown(m)
}

var xxx_messageInfo_ConnectRequest proto.InternalMessageInfo

func (m *ConnectRequest) GetUser() string {
	if m != nil {
		return m.User
	}
	return ""
}

type ChatMessageRequest struct {
	User                 string               `protobuf:"bytes,1,opt,name=user,proto3" json:"user,omitempty"`
	Memo                 string               `protobuf:"bytes,2,opt,name=memo,proto3" json:"memo,omitempty"`
	Channel              string               `protobuf:"bytes,3,opt,name=channel,proto3" json:"channel,omitempty"`
	PostDate             *timestamp.Timestamp `protobuf:"bytes,4,opt,name=post_date,json=postDate,proto3" json:"post_date,omitempty"`
	XXX_NoUnkeyedLiteral struct{}             `json:"-"`
	XXX_unrecognized     []byte               `json:"-"`
	XXX_sizecache        int32                `json:"-"`
}

func (m *ChatMessageRequest) Reset()         { *m = ChatMessageRequest{} }
func (m *ChatMessageRequest) String() string { return proto.CompactTextString(m) }
func (*ChatMessageRequest) ProtoMessage()    {}
func (*ChatMessageRequest) Descriptor() ([]byte, []int) {
	return fileDescriptor_8c585a45e2093e54, []int{1}
}

func (m *ChatMessageRequest) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_ChatMessageRequest.Unmarshal(m, b)
}
func (m *ChatMessageRequest) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_ChatMessageRequest.Marshal(b, m, deterministic)
}
func (m *ChatMessageRequest) XXX_Merge(src proto.Message) {
	xxx_messageInfo_ChatMessageRequest.Merge(m, src)
}
func (m *ChatMessageRequest) XXX_Size() int {
	return xxx_messageInfo_ChatMessageRequest.Size(m)
}
func (m *ChatMessageRequest) XXX_DiscardUnknown() {
	xxx_messageInfo_ChatMessageRequest.DiscardUnknown(m)
}

var xxx_messageInfo_ChatMessageRequest proto.InternalMessageInfo

func (m *ChatMessageRequest) GetUser() string {
	if m != nil {
		return m.User
	}
	return ""
}

func (m *ChatMessageRequest) GetMemo() string {
	if m != nil {
		return m.Memo
	}
	return ""
}

func (m *ChatMessageRequest) GetChannel() string {
	if m != nil {
		return m.Channel
	}
	return ""
}

func (m *ChatMessageRequest) GetPostDate() *timestamp.Timestamp {
	if m != nil {
		return m.PostDate
	}
	return nil
}

type EmptyMessage struct {
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *EmptyMessage) Reset()         { *m = EmptyMessage{} }
func (m *EmptyMessage) String() string { return proto.CompactTextString(m) }
func (*EmptyMessage) ProtoMessage()    {}
func (*EmptyMessage) Descriptor() ([]byte, []int) {
	return fileDescriptor_8c585a45e2093e54, []int{2}
}

func (m *EmptyMessage) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_EmptyMessage.Unmarshal(m, b)
}
func (m *EmptyMessage) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_EmptyMessage.Marshal(b, m, deterministic)
}
func (m *EmptyMessage) XXX_Merge(src proto.Message) {
	xxx_messageInfo_EmptyMessage.Merge(m, src)
}
func (m *EmptyMessage) XXX_Size() int {
	return xxx_messageInfo_EmptyMessage.Size(m)
}
func (m *EmptyMessage) XXX_DiscardUnknown() {
	xxx_messageInfo_EmptyMessage.DiscardUnknown(m)
}

var xxx_messageInfo_EmptyMessage proto.InternalMessageInfo

type BroadcastMessage struct {
	ChatMessage          *ChatMessageRequest `protobuf:"bytes,1,opt,name=chat_message,json=chatMessage,proto3" json:"chat_message,omitempty"`
	Id                   int32               `protobuf:"varint,2,opt,name=id,proto3" json:"id,omitempty"`
	XXX_NoUnkeyedLiteral struct{}            `json:"-"`
	XXX_unrecognized     []byte              `json:"-"`
	XXX_sizecache        int32               `json:"-"`
}

func (m *BroadcastMessage) Reset()         { *m = BroadcastMessage{} }
func (m *BroadcastMessage) String() string { return proto.CompactTextString(m) }
func (*BroadcastMessage) ProtoMessage()    {}
func (*BroadcastMessage) Descriptor() ([]byte, []int) {
	return fileDescriptor_8c585a45e2093e54, []int{3}
}

func (m *BroadcastMessage) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_BroadcastMessage.Unmarshal(m, b)
}
func (m *BroadcastMessage) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_BroadcastMessage.Marshal(b, m, deterministic)
}
func (m *BroadcastMessage) XXX_Merge(src proto.Message) {
	xxx_messageInfo_BroadcastMessage.Merge(m, src)
}
func (m *BroadcastMessage) XXX_Size() int {
	return xxx_messageInfo_BroadcastMessage.Size(m)
}
func (m *BroadcastMessage) XXX_DiscardUnknown() {
	xxx_messageInfo_BroadcastMessage.DiscardUnknown(m)
}

var xxx_messageInfo_BroadcastMessage proto.InternalMessageInfo

func (m *BroadcastMessage) GetChatMessage() *ChatMessageRequest {
	if m != nil {
		return m.ChatMessage
	}
	return nil
}

func (m *BroadcastMessage) GetId() int32 {
	if m != nil {
		return m.Id
	}
	return 0
}

type NewChannelRequest struct {
	Name                 string   `protobuf:"bytes,1,opt,name=name,proto3" json:"name,omitempty"`
	Description          string   `protobuf:"bytes,2,opt,name=description,proto3" json:"description,omitempty"`
	Owner                string   `protobuf:"bytes,3,opt,name=owner,proto3" json:"owner,omitempty"`
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *NewChannelRequest) Reset()         { *m = NewChannelRequest{} }
func (m *NewChannelRequest) String() string { return proto.CompactTextString(m) }
func (*NewChannelRequest) ProtoMessage()    {}
func (*NewChannelRequest) Descriptor() ([]byte, []int) {
	return fileDescriptor_8c585a45e2093e54, []int{4}
}

func (m *NewChannelRequest) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_NewChannelRequest.Unmarshal(m, b)
}
func (m *NewChannelRequest) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_NewChannelRequest.Marshal(b, m, deterministic)
}
func (m *NewChannelRequest) XXX_Merge(src proto.Message) {
	xxx_messageInfo_NewChannelRequest.Merge(m, src)
}
func (m *NewChannelRequest) XXX_Size() int {
	return xxx_messageInfo_NewChannelRequest.Size(m)
}
func (m *NewChannelRequest) XXX_DiscardUnknown() {
	xxx_messageInfo_NewChannelRequest.DiscardUnknown(m)
}

var xxx_messageInfo_NewChannelRequest proto.InternalMessageInfo

func (m *NewChannelRequest) GetName() string {
	if m != nil {
		return m.Name
	}
	return ""
}

func (m *NewChannelRequest) GetDescription() string {
	if m != nil {
		return m.Description
	}
	return ""
}

func (m *NewChannelRequest) GetOwner() string {
	if m != nil {
		return m.Owner
	}
	return ""
}

type NewUserRequest struct {
	Name                 string   `protobuf:"bytes,1,opt,name=name,proto3" json:"name,omitempty"`
	ImagePath            string   `protobuf:"bytes,2,opt,name=image_path,json=imagePath,proto3" json:"image_path,omitempty"`
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *NewUserRequest) Reset()         { *m = NewUserRequest{} }
func (m *NewUserRequest) String() string { return proto.CompactTextString(m) }
func (*NewUserRequest) ProtoMessage()    {}
func (*NewUserRequest) Descriptor() ([]byte, []int) {
	return fileDescriptor_8c585a45e2093e54, []int{5}
}

func (m *NewUserRequest) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_NewUserRequest.Unmarshal(m, b)
}
func (m *NewUserRequest) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_NewUserRequest.Marshal(b, m, deterministic)
}
func (m *NewUserRequest) XXX_Merge(src proto.Message) {
	xxx_messageInfo_NewUserRequest.Merge(m, src)
}
func (m *NewUserRequest) XXX_Size() int {
	return xxx_messageInfo_NewUserRequest.Size(m)
}
func (m *NewUserRequest) XXX_DiscardUnknown() {
	xxx_messageInfo_NewUserRequest.DiscardUnknown(m)
}

var xxx_messageInfo_NewUserRequest proto.InternalMessageInfo

func (m *NewUserRequest) GetName() string {
	if m != nil {
		return m.Name
	}
	return ""
}

func (m *NewUserRequest) GetImagePath() string {
	if m != nil {
		return m.ImagePath
	}
	return ""
}

func init() {
	proto.RegisterType((*ConnectRequest)(nil), "chat.ConnectRequest")
	proto.RegisterType((*ChatMessageRequest)(nil), "chat.ChatMessageRequest")
	proto.RegisterType((*EmptyMessage)(nil), "chat.EmptyMessage")
	proto.RegisterType((*BroadcastMessage)(nil), "chat.BroadcastMessage")
	proto.RegisterType((*NewChannelRequest)(nil), "chat.NewChannelRequest")
	proto.RegisterType((*NewUserRequest)(nil), "chat.NewUserRequest")
}

func init() {
	proto.RegisterFile("chat.proto", fileDescriptor_8c585a45e2093e54)
}

var fileDescriptor_8c585a45e2093e54 = []byte{
	// 393 bytes of a gzipped FileDescriptorProto
	0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0xff, 0x7c, 0x92, 0x4f, 0x8b, 0xdb, 0x30,
	0x10, 0xc5, 0x71, 0x9a, 0x34, 0xcd, 0x38, 0x98, 0x56, 0x04, 0x6a, 0x0c, 0xa5, 0xc1, 0xf4, 0x90,
	0x93, 0x53, 0x92, 0x43, 0x69, 0x7b, 0x4a, 0xdd, 0x1e, 0x1b, 0x8a, 0xbb, 0x7b, 0x36, 0x8a, 0x35,
	0x6b, 0x1b, 0x22, 0xcb, 0x6b, 0x29, 0x1b, 0xf6, 0x53, 0xec, 0xb7, 0xdd, 0xf3, 0x22, 0xc9, 0x66,
	0x13, 0xf2, 0xe7, 0x36, 0xf3, 0xfc, 0x46, 0xbc, 0xf9, 0x8d, 0x01, 0xb2, 0x82, 0xaa, 0xa8, 0x6e,
	0x84, 0x12, 0xa4, 0xaf, 0xeb, 0xe0, 0x73, 0x2e, 0x44, 0xbe, 0xc5, 0xb9, 0xd1, 0x36, 0xbb, 0xbb,
	0xb9, 0x2a, 0x39, 0x4a, 0x45, 0x79, 0x6d, 0x6d, 0xe1, 0x17, 0xf0, 0x62, 0x51, 0x55, 0x98, 0xa9,
	0x04, 0xef, 0x77, 0x28, 0x15, 0x21, 0xd0, 0xdf, 0x49, 0x6c, 0x7c, 0x67, 0xea, 0xcc, 0x46, 0x89,
	0xa9, 0xc3, 0x27, 0x07, 0x48, 0x5c, 0x50, 0xf5, 0x17, 0xa5, 0xa4, 0x39, 0x5e, 0xb1, 0x6a, 0x8d,
	0x23, 0x17, 0x7e, 0xcf, 0x6a, 0xba, 0x26, 0x3e, 0x0c, 0xb3, 0x82, 0x56, 0x15, 0x6e, 0xfd, 0x37,
	0x46, 0xee, 0x5a, 0xf2, 0x0d, 0x46, 0xb5, 0x90, 0x2a, 0x65, 0x54, 0xa1, 0xdf, 0x9f, 0x3a, 0x33,
	0x77, 0x11, 0x44, 0x36, 0x73, 0xd4, 0x65, 0x8e, 0x6e, 0xba, 0xcc, 0xc9, 0x3b, 0x6d, 0xfe, 0x4d,
	0x15, 0x86, 0x1e, 0x8c, 0xff, 0xf0, 0x5a, 0x3d, 0xb6, 0x89, 0xc2, 0x14, 0xde, 0xff, 0x6a, 0x04,
	0x65, 0x19, 0x95, 0x5d, 0x4a, 0xf2, 0x13, 0xc6, 0x1a, 0x42, 0xca, 0x6d, 0x6f, 0x62, 0xba, 0x0b,
	0x3f, 0x32, 0x94, 0x4e, 0xd7, 0x49, 0xdc, 0xec, 0x55, 0x23, 0x1e, 0xf4, 0x4a, 0x66, 0xb6, 0x18,
	0x24, 0xbd, 0x92, 0x85, 0x29, 0x7c, 0x58, 0xe3, 0x3e, 0xb6, 0xb9, 0x0f, 0x00, 0x54, 0x94, 0x63,
	0x07, 0x40, 0xd7, 0x64, 0x0a, 0x2e, 0x43, 0x99, 0x35, 0x65, 0xad, 0x4a, 0x51, 0xb5, 0x1c, 0x0e,
	0x25, 0x32, 0x81, 0x81, 0xd8, 0x57, 0xd8, 0xb4, 0x30, 0x6c, 0x13, 0xc6, 0xe0, 0xad, 0x71, 0x7f,
	0x2b, 0xb1, 0xb9, 0xf6, 0xfa, 0x27, 0x80, 0x92, 0xd3, 0x1c, 0xd3, 0x9a, 0xaa, 0xa2, 0x7d, 0x7c,
	0x64, 0x94, 0x7f, 0x54, 0x15, 0x8b, 0x67, 0x07, 0x5c, 0xbd, 0xd9, 0x7f, 0x6c, 0x1e, 0xca, 0x4c,
	0x23, 0x18, 0xb6, 0xe7, 0x25, 0x93, 0x76, 0xef, 0xa3, 0x6b, 0x07, 0x17, 0x69, 0x7c, 0x75, 0xc8,
	0x0f, 0x80, 0x15, 0x63, 0x1d, 0x90, 0x8b, 0xce, 0x80, 0xd8, 0x2f, 0x87, 0xf7, 0x20, 0xdf, 0xcd,
	0x6c, 0x8b, 0x8b, 0x7c, 0xb4, 0x8e, 0x13, 0x80, 0x67, 0x47, 0x97, 0x30, 0x5c, 0x31, 0xa6, 0x41,
	0x74, 0x99, 0x8f, 0xb9, 0x9c, 0x1b, 0xda, 0xbc, 0x35, 0x7f, 0xcb, 0xf2, 0x25, 0x00, 0x00, 0xff,
	0xff, 0xe5, 0xba, 0x6d, 0xbe, 0x03, 0x03, 0x00, 0x00,
}

// Reference imports to suppress errors if they are not otherwise used.
var _ context.Context
var _ grpc.ClientConnInterface

// This is a compile-time assertion to ensure that this generated file
// is compatible with the grpc package it is being compiled against.
const _ = grpc.SupportPackageIsVersion6

// ChatServiceClient is the client API for ChatService service.
//
// For semantics around ctx use and closing/ending streaming RPCs, please refer to https://godoc.org/google.golang.org/grpc#ClientConn.NewStream.
type ChatServiceClient interface {
	Connect(ctx context.Context, in *ConnectRequest, opts ...grpc.CallOption) (ChatService_ConnectClient, error)
	AddMessage(ctx context.Context, in *ChatMessageRequest, opts ...grpc.CallOption) (*EmptyMessage, error)
	AddChannel(ctx context.Context, in *NewChannelRequest, opts ...grpc.CallOption) (*EmptyMessage, error)
	AddUser(ctx context.Context, in *NewUserRequest, opts ...grpc.CallOption) (*EmptyMessage, error)
}

type chatServiceClient struct {
	cc grpc.ClientConnInterface
}

func NewChatServiceClient(cc grpc.ClientConnInterface) ChatServiceClient {
	return &chatServiceClient{cc}
}

func (c *chatServiceClient) Connect(ctx context.Context, in *ConnectRequest, opts ...grpc.CallOption) (ChatService_ConnectClient, error) {
	stream, err := c.cc.NewStream(ctx, &_ChatService_serviceDesc.Streams[0], "/chat.ChatService/Connect", opts...)
	if err != nil {
		return nil, err
	}
	x := &chatServiceConnectClient{stream}
	if err := x.ClientStream.SendMsg(in); err != nil {
		return nil, err
	}
	if err := x.ClientStream.CloseSend(); err != nil {
		return nil, err
	}
	return x, nil
}

type ChatService_ConnectClient interface {
	Recv() (*ChatMessageRequest, error)
	grpc.ClientStream
}

type chatServiceConnectClient struct {
	grpc.ClientStream
}

func (x *chatServiceConnectClient) Recv() (*ChatMessageRequest, error) {
	m := new(ChatMessageRequest)
	if err := x.ClientStream.RecvMsg(m); err != nil {
		return nil, err
	}
	return m, nil
}

func (c *chatServiceClient) AddMessage(ctx context.Context, in *ChatMessageRequest, opts ...grpc.CallOption) (*EmptyMessage, error) {
	out := new(EmptyMessage)
	err := c.cc.Invoke(ctx, "/chat.ChatService/AddMessage", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *chatServiceClient) AddChannel(ctx context.Context, in *NewChannelRequest, opts ...grpc.CallOption) (*EmptyMessage, error) {
	out := new(EmptyMessage)
	err := c.cc.Invoke(ctx, "/chat.ChatService/AddChannel", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *chatServiceClient) AddUser(ctx context.Context, in *NewUserRequest, opts ...grpc.CallOption) (*EmptyMessage, error) {
	out := new(EmptyMessage)
	err := c.cc.Invoke(ctx, "/chat.ChatService/AddUser", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// ChatServiceServer is the server API for ChatService service.
type ChatServiceServer interface {
	Connect(*ConnectRequest, ChatService_ConnectServer) error
	AddMessage(context.Context, *ChatMessageRequest) (*EmptyMessage, error)
	AddChannel(context.Context, *NewChannelRequest) (*EmptyMessage, error)
	AddUser(context.Context, *NewUserRequest) (*EmptyMessage, error)
}

// UnimplementedChatServiceServer can be embedded to have forward compatible implementations.
type UnimplementedChatServiceServer struct {
}

func (*UnimplementedChatServiceServer) Connect(req *ConnectRequest, srv ChatService_ConnectServer) error {
	return status.Errorf(codes.Unimplemented, "method Connect not implemented")
}
func (*UnimplementedChatServiceServer) AddMessage(ctx context.Context, req *ChatMessageRequest) (*EmptyMessage, error) {
	return nil, status.Errorf(codes.Unimplemented, "method AddMessage not implemented")
}
func (*UnimplementedChatServiceServer) AddChannel(ctx context.Context, req *NewChannelRequest) (*EmptyMessage, error) {
	return nil, status.Errorf(codes.Unimplemented, "method AddChannel not implemented")
}
func (*UnimplementedChatServiceServer) AddUser(ctx context.Context, req *NewUserRequest) (*EmptyMessage, error) {
	return nil, status.Errorf(codes.Unimplemented, "method AddUser not implemented")
}

func RegisterChatServiceServer(s *grpc.Server, srv ChatServiceServer) {
	s.RegisterService(&_ChatService_serviceDesc, srv)
}

func _ChatService_Connect_Handler(srv interface{}, stream grpc.ServerStream) error {
	m := new(ConnectRequest)
	if err := stream.RecvMsg(m); err != nil {
		return err
	}
	return srv.(ChatServiceServer).Connect(m, &chatServiceConnectServer{stream})
}

type ChatService_ConnectServer interface {
	Send(*ChatMessageRequest) error
	grpc.ServerStream
}

type chatServiceConnectServer struct {
	grpc.ServerStream
}

func (x *chatServiceConnectServer) Send(m *ChatMessageRequest) error {
	return x.ServerStream.SendMsg(m)
}

func _ChatService_AddMessage_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(ChatMessageRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(ChatServiceServer).AddMessage(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/chat.ChatService/AddMessage",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(ChatServiceServer).AddMessage(ctx, req.(*ChatMessageRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _ChatService_AddChannel_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(NewChannelRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(ChatServiceServer).AddChannel(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/chat.ChatService/AddChannel",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(ChatServiceServer).AddChannel(ctx, req.(*NewChannelRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _ChatService_AddUser_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(NewUserRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(ChatServiceServer).AddUser(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/chat.ChatService/AddUser",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(ChatServiceServer).AddUser(ctx, req.(*NewUserRequest))
	}
	return interceptor(ctx, in, info, handler)
}

var _ChatService_serviceDesc = grpc.ServiceDesc{
	ServiceName: "chat.ChatService",
	HandlerType: (*ChatServiceServer)(nil),
	Methods: []grpc.MethodDesc{
		{
			MethodName: "AddMessage",
			Handler:    _ChatService_AddMessage_Handler,
		},
		{
			MethodName: "AddChannel",
			Handler:    _ChatService_AddChannel_Handler,
		},
		{
			MethodName: "AddUser",
			Handler:    _ChatService_AddUser_Handler,
		},
	},
	Streams: []grpc.StreamDesc{
		{
			StreamName:    "Connect",
			Handler:       _ChatService_Connect_Handler,
			ServerStreams: true,
		},
	},
	Metadata: "chat.proto",
}
