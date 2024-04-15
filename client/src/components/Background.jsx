import "./Background.css";
function Background() {
  if (window.location.pathname.startsWith("/adminHome")) {
    return <> </>;
  }

  return (
    <div className="background-container">
      <div className="semi-circle"></div>
    </div>
  );
}

export default Background;
