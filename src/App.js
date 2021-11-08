import { useState } from "react";
import "./App.css";
import img2 from "./images/2.png";
import img3 from "./images/3.png";
import img4 from "./images/4.png";
import img5 from "./images/5.png";
import img6 from "./images/6.png";

function App() {
  const list = [
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
  ];

  const [basicdata, setBasicdata] = useState({
    currentPage: 0, // 默认首图的序列
    start: {
      // 记录起始位置
      x: 0,
      y: 0,
      t: Date.now(),
    },
    end: {
      // 记录终点位置
      x: 0,
      y: 0,
    },
  });

  const [temporaryData, setTemporaryData] = useState({
    visible: 3, // 记录默认显示堆叠数visible
    poswidth: "", // 记录位移
    posheight: "", // 记录位移
    lastPosWidth: "", // 记录上次最终位移
    lastPosHeight: "", // 记录上次最终位移
    tracking: false, // 是否在滑动，防止多次操作，影响体验
    animation: false, // 首图是否启用动画效果，默认为否
    opacity: 1, // 记录首图透明度
    swipe: false, // onTransition判定条件
  });

  const transformStyle = (index) => {
    let style = null;
    // 非首页
    if (index > basicdata.currentPage) {
      //在页面上可视有多少张
      const visible = temporaryData.visible;
      // 在Zindex上的顺序
      const perIndex = index - basicdata.currentPage;
      // visible可见数量前滑块的样式
      if (index <= basicdata.currentPage + visible - 1) {
        style = {
          opacity: 1,
          transform: `translate3D(0,0, ${-perIndex * 60}px)`,
          zIndex: visible - index + basicdata.currentPage,
          transitionTimingFunction: "ease",
          transitionDuration: "300ms",
        };
      } else {
        // visible不可见数量前滑块的样式
        style = {
          zIndex: -1,
          transform: `translate3D(0,0, ${-visible * 60}px)`,
        };
      }
    } else if (index === basicdata.currentPage - 1) {
      style = {
        zIndex: -1,
        opacity: 0,
        transform: `translate3D(${temporaryData.lastPosWidth}px, ${temporaryData.lastPosHeight}px, 0px)`,
        transitionTimingFunction: "ease",
        transitionDuration: "300ms",
      };
    } else if (index === basicdata.currentPage) {
      //如果是首页
      style = {
        zIndex: 10,
        opacity: temporaryData.opacity,
        transform: `translate3D(${temporaryData.poswidth}px, ${temporaryData.posheight}px, 0px)`,
      };
      if (temporaryData.animation) {
        style["transitionTimingFunction"] = "ease";
        style["transitionDuration"] = 300 + "ms";
      }
    }
    return style;
  };

  const onTouchStart = (e) => {
    if (temporaryData.tracking) return false;

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
      }
    } else {
      setBasicdata({
        ...basicdata,
        ...{
          start: {
            x: e.clientX,
            y: e.clientY,
          },
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
    // 简单判断滑动宽度超出100像素时触发滑出
    if (Math.abs(temporaryData.poswidth) >= 100) {
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
          lastPosHeight: temporaryData.posheight,
          lastPosWidth: temporaryData.poswidth,
        },
      });
      setBasicdata({
        ...basicdata,
        ...{
          currentPage: basicdata.currentPage + 1,
        },
      });
      setTimeout(() => {
        setTemporaryData({
          ...temporaryData,
          ...{
            poswidth: 0,
            posheight: 0,
            opacity: 1,
          },
        });
      });
    } else {
      setTemporaryData({
        ...temporaryData,
        ...{
          poswidth: 0,
          posheight: 0,
          swipe: false,
        },
      });
    }
  };

  const onTransitionEnd = (index) => {
    if (temporaryData.swipe && index === basicdata.currentPage - 1) {
      setTemporaryData({
        ...temporaryData,
        ...{
          animation: true,
          lastPosWidth: 0,
          lastPosHeight: 0,
          swipe: false,
        },
      });
    }
  };

  return (
    <div className="stack-wrapper">
      <ul className="stack">
        {list.map((item, index) => {
          const style = transformStyle(index);
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
  );
}

export default App;
