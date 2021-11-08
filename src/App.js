import { useState, useMemo, useRef } from "react";
import detectPrefixes from "./util/detect";
import "./App.css";
import img2 from "./images/2.png";
import img3 from "./images/3.png";
import img4 from "./images/4.png";
import img5 from "./images/5.png";
import img6 from "./images/6.png";

function App() {
  const containerRef = useRef(null);
  const [list, setList] = useState([
    {
      src: img2,
    },
    {
      src: img3,
    },
    {
      src: img4,
    },
    {
      src: img5,
    },
    {
      src: img6,
    },
  ]);
  const [basicdata, setBasicdata] = useState({
    start: {
      // 记录起始位置
      x: 0,
      y: 0,
      t: null,
    },
    end: {
      // 记录终点位置
      x: 0,
      y: 0,
    },
  });

  const [temporaryData, setTemporaryData] = useState({
    prefixes: detectPrefixes(),
    offsetY: "",
    poswidth: 0,
    posheight: 0,
    lastPosWidth: 0,
    lastPosHeight: 0,
    lastZindex: 0,
    rotate: 0,
    lastRotate: 0,
    visible: 3,
    tracking: false,
    animation: false,
    currentPage: 0,
    opacity: 1,
    lastOpacity: 0,
    swipe: false,
    zIndex: 10,
  });

  // offsetRatio
  const offsetRatio = useMemo(() => {
    const width = containerRef.current?.offsetWidth;
    const height = containerRef.current?.offsetHeight;
    const offsetWidth = width - Math.abs(temporaryData.poswidth);
    const offsetHeight = height - Math.abs(temporaryData.posheight);
    const ratio = 1 - (offsetWidth * offsetHeight) / (width * height) || 0;
    return ratio > 1 ? 1 : ratio;
  }, [temporaryData.poswidth, temporaryData.posheight]);

  //offsetWidthRatio
  const offsetWidthRatio = useMemo(() => {
    const width = containerRef.current?.offsetWidth;
    const offsetWidth = width - Math.abs(temporaryData.poswidth);
    const ratio = 1 - offsetWidth / width || 0;
    return ratio;
  }, [temporaryData.poswidth]);

  const onTouchStart = (e) => {
    if (temporaryData.tracking) return;
    if (e.type === "touchstart") {
      if (e.touches.length > 1) {
        setTemporaryData({
          ...temporaryData,
          ...{
            tracking: false,
          },
        });
        return;
      } else {
        setBasicdata({
          ...basicdata,
          ...{
            start: {
              t: new Date().getTime(),
              x: e.targetTouches[0].clientX,
              y: e.targetTouches[0].clientY,
            },
            end: {
              x: e.targetTouches[0].clientX,
              y: e.targetTouches[0].clientY,
            },
          },
        });
        setTemporaryData({
          ...temporaryData,
          ...{
            offsetY:
              e.targetTouches[0].pageY -
              containerRef.current?.offsetParent.offsetTop,
          },
        });
      }
    } else {
      setBasicdata({
        ...basicdata,
        ...{
          start: {
            t: new Date().getTime(),
            x: e.clientX,
            y: e.clientY,
          },
          end: {
            x: e.clientX,
            y: e.clientY,
          },
        },
      });
      setTemporaryData({
        ...temporaryData,
        ...{
          offsetY: e.offsetY,
        },
      });
    }
    setTemporaryData({
      ...temporaryData,
      ...{
        tracking: true,
        animation: false,
      },
    });
  };

  const onTouchMove = (e) => {
    if (temporaryData.tracking && !temporaryData.animation) {
      if (e.type === "touchmove") {
        setBasicdata({
          ...basicdata,
          ...{
            end: {
              x: e.targetTouches[0].clientX,
              y: e.targetTouches[0].clientY,
            },
          },
        });
      } else {
        setBasicdata({
          ...basicdata,
          ...{
            end: {
              x: e.clientX,
              y: e.clientY,
            },
          },
        });
      }
      setTemporaryData({
        ...temporaryData,
        ...{
          poswidth: basicdata.end.x - basicdata.start.x,
          posheight: basicdata.end.y - basicdata.start.y,
          rotate: rotateDirection() * offsetWidthRatio * 15 * angleRatio(),
        },
      });
    }
  };

  const onTouchEnd = (e) => {
    setTemporaryData({
      ...temporaryData,
      ...{
        tracking: false,
        animation: true,
      },
    });
    // 滑动结束，触发判断
    // 判断划出面积是否大于0.4
    if (offsetRatio >= 0.4) {
      // 最终位移简单设定为x轴200像素的偏移
      const ratio = Math.abs(temporaryData.posheight / temporaryData.poswidth);
      setTemporaryData({
        ...temporaryData,
        ...{
          poswidth:
            temporaryData.poswidth >= 0
              ? temporaryData.poswidth + 200
              : temporaryData.poswidth - 200,
          posheight:
            temporaryData.posheight >= 0
              ? Math.abs(temporaryData.poswidth * ratio)
              : -Math.abs(temporaryData.poswidth * ratio),
          opacity: 0,
          swipe: true,
        },
      });
      nextTick();
    } else {
      setTemporaryData({
        ...temporaryData,
        ...{
          poswidth: 0,
          posheight: 0,
          swipe: false,
          rotate: 0,
        },
      });
    }
  };

  const nextTick = () => {
    setTemporaryData({
      ...temporaryData,
      ...{
        lastPosWidth: temporaryData.poswidth,
        lastPosHeight: temporaryData.posheight,
        lastRotate: temporaryData.rotate,
        lastZindex: 20,
        currentPage:
          temporaryData.currentPage === list.length - 1
            ? 0
            : temporaryData.currentPage + 1,
      },
    });
    // currentPage切换，整体dom进行变化，把第一层滑动置最低
    setTimeout(() => {
      setTemporaryData({
        ...temporaryData,
        ...{
          poswidth: 0,
          posheight: 0,
          opacity: 1,
          rotate: 0,
        },
      });
    }, 0);
  };

  const onTransitionEnd = (index) => {
    const lastPage =
      temporaryData.currentPage === 0
        ? list.length - 1
        : temporaryData.currentPage - 1;
    if (temporaryData.swipe && index === lastPage) {
      setTemporaryData({
        ...temporaryData,
        ...{
          animation: true,
          lastPosWidth: 0,
          lastPosHeight: 0,
          lastOpacity: 0,
          lastRotate: 0,
          swipe: false,
          lastZindex: -1,
        },
      });
    }
  };

  const rotateDirection = () => {
    return temporaryData?.poswidth <= 0 ? -1 : 1;
  };

  const angleRatio = () => {
    const height = containerRef.current?.offsetHeight;
    const offsetY = temporaryData.offsetY;
    const ratio = -1 * ((2 * offsetY) / height - 1) || 0;
    return ratio;
  };

  const inStack = (index, currentPage) => {
    let stack = [];
    let visible = temporaryData.visible;
    let length = list.length;
    for (let i = 0; i < visible; i++) {
      if (currentPage + i < length) {
        stack.push(currentPage + i);
      } else {
        stack.push(currentPage + i - length);
      }
    }
    return stack.indexOf(index) >= 0;
  };

  const transform = (index) => {
    let currentPage = temporaryData.currentPage;
    let length = list.length;
    let lastPage = currentPage === 0 ? list.length - 1 : currentPage - 1;
    let style = {};
    let visible = temporaryData.visible;
    if (index === temporaryData.currentPage) {
      return;
    }
    if (inStack(index, currentPage)) {
      let perIndex =
        index - currentPage > 0
          ? index - currentPage
          : index - currentPage + length;
      style["opacity"] = "1";
      style["transform"] =
        "translate3D(0,0," + -1 * 60 * (perIndex - offsetRatio) + "px" + ")";
      style["zIndex"] = visible - perIndex;
      if (!temporaryData.tracking) {
        style[temporaryData.prefixes.transition + "TimingFunction"] = "ease";
        style[temporaryData.prefixes.transition + "Duration"] = 300 + "ms";
      }
    } else if (index === lastPage) {
      style["transform"] =
        "translate3D(" +
        temporaryData.lastPosWidth +
        "px" +
        "," +
        temporaryData.lastPosHeight +
        "px" +
        ",0px) " +
        "rotate(" +
        temporaryData.lastRotate +
        "deg)";
      style["opacity"] = temporaryData.lastOpacity;
      style["zIndex"] = temporaryData.lastZindex;
      style[temporaryData.prefixes.transition + "TimingFunction"] = "ease";
      style[temporaryData.prefixes.transition + "Duration"] = 300 + "ms";
    } else {
      style["zIndex"] = "-1";
      style["transform"] = "translate3D(0,0," + -1 * visible * 60 + "px" + ")";
    }
    return style;
  };

  const transformIndex = (index) => {
    if (index === temporaryData.currentPage) {
      let style = {};
      style["transform"] =
        "translate3D(" +
        temporaryData.poswidth +
        "px" +
        "," +
        temporaryData.posheight +
        "px" +
        ",0px) " +
        "rotate(" +
        temporaryData.rotate +
        "deg)";
      style["opacity"] = temporaryData.opacity;
      style["zIndex"] = 10;
      if (temporaryData.animation) {
        style[temporaryData.prefixes.transition + "TimingFunction"] = "ease";
        style[temporaryData.prefixes.transition + "Duration"] =
          (temporaryData.animation ? 300 : 0) + "ms";
      }
      return style;
    }
  };

  return (
    <div className="app">
      <div className="stack-wrapper">
        <ul className="stack" ref={containerRef}>
          {list.map((item, index) => {
            const style =
              index === temporaryData.currentPage
                ? transformIndex(index)
                : transform(index);
            return (
              <li
                key={index}
                className="stack-item"
                style={style}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onTouchCancel={onTouchEnd}
                onMouseDown={onTouchStart}
                onMouseMove={onTouchMove}
                onMouseUp={onTouchEnd}
                onMouseOut={onTouchEnd}
                onTransitionEnd={(e) => onTransitionEnd(index)}
              >
                <img src={item.src} />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default App;
