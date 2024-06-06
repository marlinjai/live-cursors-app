import throttle from "lodash.throttle";
import PropTypes from "prop-types";
import { useEffect, useRef } from "react";
import useWebsocket from "react-use-websocket";
import { Cursor } from "./components/Cursor";

const renderCursors = (users) => {
  return Object.keys(users).map((uuid) => {
    const user = users[uuid];
    if (!user.state) return null;
    return <Cursor key={uuid} point={[user.state.x, user.state.y]} />;
  });
};

const renderUsersList = (users) => {
  return (
    <ul>
      {Object.keys(users).map((uuid) => {
        const user = users[uuid];
        const position = user.state
          ? `(${user.state.x}, ${user.state.y})`
          : "(Not available)";
        return (
          <li key={uuid}>
            {user.username}: {position}
          </li>
        );
      })}
    </ul>
  );
};

export function Home({ username }) {
  const WS_URL = "ws://127.0.0.1:8000";
  const { sendJsonMessage, lastJsonMessage } = useWebsocket(WS_URL, {
    queryParams: { username },
  });

  const THROTTLE = 50;
  const sendJsonMessageThrottled = useRef(throttle(sendJsonMessage, THROTTLE));

  useEffect(() => {
    sendJsonMessage({ x: 0, y: 0 });
    const handleMouseMove = (e) => {
      sendJsonMessageThrottled.current({
        x: e.clientX,
        y: e.clientY,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const users = lastJsonMessage ? JSON.parse(lastJsonMessage) : {};

  return (
    <>
      {renderCursors(users)}
      {renderUsersList(users)}
    </>
  );
}

Home.propTypes = {
  username: PropTypes.string.isRequired,
};
