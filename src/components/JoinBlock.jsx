import React from "react";
import axios from "axios";

function JoinBlock({ onLogin }) {
    const [roomId, setRoomId] = React.useState('');
    const [userName, setUserName] = React.useState("");
    const [isLoading, setLoading] = React.useState(false);
    // показать/скрыть поле ввода для id комнаты
    const [connectRoom, setConnectRoom] = React.useState(false);
    
    // войти в комнату
    const onEnter = async () => {
        // проверим не пусты ли поля для ввода
        if ( (connectRoom && !roomId) || !userName) {
            return alert("Неверные данные");
        }
        // создадим обьект для передачи на сервер
        const obj = {
            // id комнаты
            roomId: (connectRoom && roomId) || Math.random().toString(),
            // имя пользователя
            userName,
        };
        // сделаем кнопку disabled чтобы нельзя было нажать второй раз
        setLoading(true);
        // отправляем obj на сервер
        await axios.post("/rooms", obj);
        onLogin(obj);
    };

    return (
        <div className="join-block">
            <input
                type="text"
                placeholder="Ваше имя"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
            />
            {connectRoom && (
                <input
                    type="text"
                    placeholder="Room ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                />
            )}
            <input
                className="form-check-input"
                type="checkbox"
                value=""
                style={{ width: "30px", height: "30px" }}
                checked={connectRoom}
                onChange={() => setConnectRoom(!connectRoom)}
            />
            <label className="form-check-label pt-2 ps-2">
                Присоединится к комнате
            </label>
            <button
                disabled={isLoading}
                onClick={onEnter}
                className="btn btn-success"
            >
                {isLoading ? "ВХОД..." : "ВОЙТИ"}
            </button>
        </div>
    );
}

export default JoinBlock;
