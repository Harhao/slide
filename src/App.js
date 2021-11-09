import React, { createRef } from "react";
import "./App.css";
import detectPrefixes from "./util/detect";
import img2 from "./images/2.png";
import img3 from "./images/3.png";
import img4 from "./images/4.png";
import img5 from "./images/5.png";
import img6 from "./images/6.png";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [
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
      ],
      basicdata: {
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
      },
      temporaryData: {
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
      },
    };
    this.containerRef = createRef(null);
  }
  // 划出面积比例
  offsetRatio = () => {
    const width = this.containerRef.current?.offsetWidth;
    const height = this.containerRef.current?.offsetHeight;
    const offsetWidth = width - Math.abs(this.state.temporaryData.poswidth);
    const offsetHeight = height - Math.abs(this.state.temporaryData.posheight);
    const ratio = 1 - (offsetWidth * offsetHeight) / (width * height) || 0;
    return ratio > 1 ? 1 : ratio;
  };
  // 划出宽度比例
  offsetWidthRatio = () => {
    const width = this.containerRef.current?.offsetWidth;
    const offsetWidth = width - Math.abs(this.state.temporaryData.poswidth);
    const ratio = 1 - offsetWidth / width || 0;
    return ratio;
  };
  // 划出角度比例
  angleRatio = () => {
    const height = this.containerRef.current?.offsetHeight;
    const offsetY = this.state.temporaryData.offsetY;
    const ratio = -1 * ((2 * offsetY) / height - 1) || 0;
    return ratio;
  };

  onTouchStart = (e) => {
    if (this.state.temporaryData.tracking) return;
    if (e.type === "touchstart") {
      if (e.touches.length > 1) {
        this.setState({
          temporaryData: {
            ...this.state.temporaryData,
            tracking: false,
          },
        });
        return;
      } else {
        this.setState({
          basicdata: {
            ...this.state.basicdata,
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
          temporaryData: {
            ...this.state.temporaryData,
            offsetY:
              e.targetTouches[0].pageY -
              this.containerRef.current?.offsetParent.offsetTop,
          },
        });
      }
    } else {
      this.setState({
        basicdata: {
          ...this.state.basicdata,
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
        temporaryData: {
          ...this.state.temporaryData,
          offsetY: e.offsetY,
        },
      });
    }
    this.setState({
      temporaryData: {
        ...this.state.temporaryData,
        tracking: true,
        animation: false,
      },
    });
  };

  onTouchMove = (e) => {
    if (
      this.state.temporaryData.tracking &&
      !this.state.temporaryData.animation
    ) {
      if (e.type === "touchmove") {
        this.setState({
          basicdata: {
            ...this.state.basicdata,
            end: {
              x: e.targetTouches[0].clientX,
              y: e.targetTouches[0].clientY,
            },
          },
        });
      } else {
        this.setState({
          basicdata: {
            ...this.state.basicdata,
            end: {
              x: e.clientX,
              y: e.clientY,
            },
          },
        });
      }
      this.setState({
        temporaryData: {
          ...this.state.temporaryData,
          poswidth: this.state.basicdata.end.x - this.state.basicdata.start.x,
          posheight: this.state.basicdata.end.y - this.state.basicdata.start.y,
          rotate:
            this.rotateDirection() *
            this.offsetWidthRatio() *
            15 *
            this.angleRatio(),
        },
      });
    }
  };

  onTouchEnd = (e) => {
    this.setState(
      {
        temporaryData: {
          ...this.state.temporaryData,
          tracking: false,
          animation: true,
        },
      },
      () => {
        // 滑动结束，触发判断
        // 判断划出面积是否大于0.4
        if (this.offsetRatio() >= 0.4) {
          // 最终位移简单设定为x轴200像素的偏移
          const ratio = Math.abs(
            this.state.temporaryData.posheight /
              this.state.temporaryData.poswidth
          );
          this.setState({
            temporaryData: {
              ...this.state.temporaryData,
              poswidth:
                this.state.temporaryData.poswidth >= 0
                  ? this.state.temporaryData.poswidth + 200
                  : this.state.temporaryData.poswidth - 200,
              posheight:
                this.state.temporaryData.posheight >= 0
                  ? Math.abs(this.state.temporaryData.poswidth * ratio)
                  : -Math.abs(this.state.temporaryData.poswidth * ratio),
              opacity: 0,
              swipe: true,
            },
          });
          this.nextTick();
        } else {
          this.setState({
            temporaryData: {
              ...this.state.temporaryData,
              poswidth: 0,
              posheight: 0,
              swipe: false,
              rotate: 0,
            },
          });
        }
      }
    );
  };

  nextTick = () => {
    this.setState({
      temporaryData: {
        ...this.state.temporaryData,
        lastPosWidth: this.state.temporaryData.poswidth,
        lastPosHeight: this.state.temporaryData.posheight,
        lastRotate: this.state.temporaryData.rotate,
        lastZindex: 20,
        currentPage:
          this.state.temporaryData.currentPage === this.state.list.length - 1
            ? 0
            : this.state.temporaryData.currentPage + 1,
      },
    });
    // currentPage切换，整体dom进行变化，把第一层滑动置最低
    setTimeout(() => {
      this.setState({
        temporaryData: {
          ...this.state.temporaryData,
          poswidth: 0,
          posheight: 0,
          opacity: 1,
          rotate: 0,
        },
      });
    }, 0);
  };

  onTransitionEnd = (index) => {
    const lastPage =
      this.state.temporaryData.currentPage === 0
        ? this.state.list.length - 1
        : this.state.temporaryData.currentPage - 1;
    if (this.state.temporaryData.swipe && index === lastPage) {
      this.setState({
        temporaryData: {
          ...this.state.temporaryData,
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

  rotateDirection = () => {
    return this.state.temporaryData?.poswidth <= 0 ? -1 : 1;
  };

  inStack = (index, currentPage) => {
    let stack = [];
    let visible = this.state.temporaryData.visible;
    let length = this.state.list.length;
    for (let i = 0; i < visible; i++) {
      if (currentPage + i < length) {
        stack.push(currentPage + i);
      } else {
        stack.push(currentPage + i - length);
      }
    }
    return stack.indexOf(index) >= 0;
  };

  transform = (index) => {
    const {
      currentPage,
      visible,
      tracking,
      prefixes,
      lastPosWidth,
      lastPosHeight,
      lastRotate,
      lastOpacity,
      lastZindex,
    } = this.state.temporaryData;
    const list = this.state.list;
    const length = list.length;
    const lastPage = currentPage === 0 ? length - 1 : currentPage - 1;
    let style = {};
    if (this.inStack(index, currentPage)) {
      const perIndex =
        index - currentPage > 0
          ? index - currentPage
          : index - currentPage + length;
      style = {
        opacity: 1,
        transform: `translate3D(0,0,${
          -1 * 60 * (perIndex - this.offsetRatio())
        }px)`,
        zIndex: visible - perIndex,
      };
      if (!tracking) {
        style[`${prefixes.transition}TimingFunction`] = "ease";
        style[`${prefixes.transition}Duration`] = 300 + "ms";
      }
    } else if (index === lastPage) {
      style = {
        transform: `translate3d(${lastPosWidth}px,${lastPosHeight}px, 0px) rotate(${lastRotate}deg)`,
        opacity: lastOpacity,
        zIndex: lastZindex,
        [`${prefixes.transition}TimingFunction`]: "ease",
        [`${prefixes.transition}Duration`]: "300ms",
      };
    } else {
      style = {
        transform: `translate3d(0,0, ${-1 * visible * 60}px)`,
        opacity: lastOpacity,
        zIndex: -1,
      };
    }
    return style;
  };

  transformIndex = (index) => {
    const { currentPage, poswidth, posheight, rotate, animation, prefixes } =
      this.state.temporaryData;
    if (index === currentPage) {
      let style = {
        transform: `translate3d(${poswidth}px, ${posheight}px, 0px) rotate(${rotate}deg)`,
        opacity: this.state.temporaryData.opacity,
        zIndex: 10,
      };
      if (animation) {
        style[prefixes.transition + "TimingFunction"] = "ease";
        style[prefixes.transition + "Duration"] = (animation ? 300 : 0) + "ms";
      }
      return style;
    }
  };

  prev = () => {
    this.slideOutside(false);
  };

  next = () => {
    this.slideOutside(true);
  };

  slideOutside = (isNext) => {
    const width = this.containerRef.current.offsetWidth;
    this.setState(
      {
        temporaryData: {
          ...this.state.temporaryData,
          tracking: false,
          animation: true,
          poswidth: isNext ? width : -width,
          posheight: 0,
          opacity: 0,
          rotate: isNext ? 3 : -3,
          swipe: true,
        },
      },
      () => {
        this.nextTick();
      }
    );
  };

  render() {
    return (
      <div className="app">
        <div className="stack-wrapper">
          <ul className="stack" ref={this.containerRef}>
            {this.state.list.map((item, index) => {
              const style =
                index === this.state.temporaryData.currentPage
                  ? this.transformIndex(index)
                  : this.transform(index);
              return (
                <li
                  key={index}
                  className="stack-item"
                  style={style}
                  onTouchStart={this.onTouchStart}
                  onTouchMove={this.onTouchMove}
                  onTouchEnd={this.onTouchEnd}
                  onTouchCancel={this.onTouchEnd}
                  onMouseDown={this.onTouchStart}
                  onMouseMove={this.onTouchMove}
                  onMouseUp={this.onTouchEnd}
                  onMouseOut={this.onTouchEnd}
                  onTransitionEnd={(e) => this.onTransitionEnd(index)}
                >
                  <img src={item.src} />
                </li>
              );
            })}
          </ul>
        </div>
        <button onClick={this.prev}>不喜欢</button>
        <button onClick={this.next}>喜欢</button>
      </div>
    );
  }
}
