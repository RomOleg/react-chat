import React from "react";
import socket from "../socket";

function Chat({
    users,
    messages,
    userName,
    roomId,
    onAddMessage,
    dateMessage,
}) {
    const [messageValue, setMessageValue] = React.useState("");
    const messagesRef = React.useRef(null);

    // отправляем сообщение в чате
    const onSendMessage = () => {

        let date = new Date();
        const obj = {
          userName,
            roomId,
            text: messageValue,
            dateMessage: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
        }
        // сокет-запрос на сервер
        socket.emit("ROOM:NEW_MESSAGE", obj);
        // отображаем сообщение в чате
        onAddMessage(obj);
        // очищаем поле для ввода сообщения
        setMessageValue("");
    };

    // копирование идентификатора комнаты
    const onCopyRoom = () => {
        let idroom = document.querySelector("#idroom");
        window.navigator.clipboard.writeText(idroom.innerHTML)
    };

    // прокрутка при заполнении блока сообщений
    React.useEffect(() => {
        messagesRef.current.scrollTo(0, 99999);
    }, [messages]);

    return (
        <div className="chat">
            <div className="chat-users">
                Комната: <b id="idroom" >{roomId}</b>
                <button
                    type="button"
                    className="btn btn-outline-success"
                    style={{ fontSize: '13px' }} 
                    onClick={() => onCopyRoom()}
                >
                    Скопировать комнату
                </button>
                <hr />
                <b>Онлайн ({users.length}):</b>
                <ul>
                    {users.map((name, index) => (
                        <li key={name + index}>{name}</li>
                    ))}
                </ul>
            </div>
            <div className="chat-messages">
                <div ref={messagesRef} className="messages">
                    {messages.map((message, index) => (
                        <div key={index} className="message">
                            <p>{message.text}</p>
                            <div>
                                <span>{message.userName}</span>
                                <span style={{ paddingLeft: "5px" }}>
                                    {message.dateMessage}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                <form>
                    <textarea
                        value={messageValue}
                        onChange={(e) => setMessageValue(e.target.value)}
                        className="form-control"
                        rows="3"
                    ></textarea>
                    <button
                        onClick={onSendMessage}
                        type="button"
                        className="btn btn-primary"
                    >
                        Отправить
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Chat;
