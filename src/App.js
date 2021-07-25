
import './App.scss';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware} from "redux";
import thunk from 'redux-thunk';
import { Provider, connect } from "react-redux";

const playSound = () => {
    let sound = document.getElementById("beep")
    sound.currentTime = 0;
    sound.volume = store.getState().volume;
    sound.play();
};

//redux
//action
const SET_SESSION = "SET_SESSION";
const SET_BREAK = "SET_BREAK";
const RUN_SESSION = "RUN_SESSION";
const RUN_BREAK = "RUN_BREAK";
const PAUSER = "PAUSER";
const RESUME = "RESUME";
const RESET = "RESET";
const ADJ_VOL = "ADJ_VOL";
const RING_PROG = "RING_PROG";

let j = 0; //timelapsed

const setSession = e => dispatch => {   
    const dispMethod = lengthadj => {
        if (store.getState().timerType === "Session" 
            && store.getState().timerPaused) {
            dispatch({
                type: SET_SESSION,
                sessionLength: lengthadj,
                timer: lengthadj*60
            });
            j=0;
        } else 
        dispatch({
            type: SET_SESSION,
            sessionLength: lengthadj,
            timer: store.getState().timer
        });
    };    
    switch (e) {
        case "decrease":
            dispMethod(store.getState().sessionLength -1);
            break;
        case "increase":
            dispMethod(store.getState().sessionLength +1);
            break;
        default:
            break;
    };  
};

const setBreak = e => dispatch => {
    const dispMethod = lengthadj => {
        if (store.getState().timerType === "Break" 
            && store.getState().timerPaused) {
            dispatch({
                type: SET_BREAK,
                breakLength: lengthadj,
                timer: lengthadj*60
            });
            j=0;
        } else 
        dispatch({
            type: SET_BREAK,
            breakLength: lengthadj,
            timer: store.getState().timer
        });
    };    
    switch (e) {
        case "decrease":
            dispMethod(store.getState().breakLength -1);
            break;
        case "increase":
            dispMethod(store.getState().breakLength +1);
            break;
        default:
            break;
    };    
};

const runSession = time => dispatch => {  
    if (store.getState().timer === 0) {
        playSound();
        dispatch ({
            type: RUN_SESSION,
            timerType: "Session",
            timer: 0
        });
    };
    dispatch(setRingProg(time+j));
    let i = 0;
    const looper = timer => {
        i++;
        setTimeout(() => {
            if (!store.getState().timerPaused 
                && store.getState().timerType === "Session") {
                dispatch({
                    type: RUN_SESSION,
                    timerType: "Session",
                    timer: timer -i
                });
                j++;
                dispatch(setRingProg(store.getState().timer+j));
                console.log(store.getState().ringProg)
                if (store.getState().timer <= 0 ){
                    j=0;
                    dispatch(runBreak(store.getState().breakLength*60+1));
                } else
                looper(timer);
            };
        }, 1000);
    };
    looper(time);
};

const runBreak = time => dispatch => {
    if (store.getState().timer === 0) {
        playSound();
        dispatch({
            type: RUN_BREAK,
            timerType: "Break",
            timer: 0
        });
    };
    dispatch(setRingProg(time+j));
    let i = 0;
    const looper = timer => {
        i++;
        setTimeout(() => {
            if (!store.getState().timerPaused 
                && store.getState().timerType === "Break") {
                dispatch({
                    type: RUN_BREAK,
                    timerType: "Break",
                    timer: timer -i
                });
                j++;
                dispatch(setRingProg(store.getState().timer+j));
                if (store.getState().timer <= 0 ){
                    j=0;
                    dispatch(runSession(store.getState().sessionLength*60+1));
                } else
                looper(timer); 
            };
        }, 1000);
    };
    looper(time);
};

const pauser = () => { 
    return {
        type: PAUSER,
        timerPaused: true,
    };
};

const resume = () => dispatch => {
    let timer = store.getState().timer;
    dispatch({
        type: RESUME,
        timerPaused: false,
    });
    dispatch(store.getState().timerType === "Session" ? 
        runSession(timer):runBreak(timer));
};

const reset = () => dispatch => {
    let sound = document.getElementById("beep")
    sound.pause();
    sound.currentTime = 0;
    j=0;
    dispatch({
        type: RESET
    });
};

const adjVol = event => {
    return {
        type: ADJ_VOL,
        volume: event.target.value
    };
};

const setRingProg = val => {
    let percent =  store.getState().timer/val
    return {
        type: RING_PROG,
        ringProg: percent
    };
};

//reducer
const TimerReducer = (state = defaultState, action) => {
    switch (action.type) {
        case SET_SESSION:
            return {
                ...state,
                sessionLength: action.sessionLength,
                timer: action.timer
            };
        case SET_BREAK:
            return {
                ...state,
                breakLength: action.breakLength,
                timer: action.timer
            };
        case RUN_SESSION:
            return {
                ...state,
                timerType: action.timerType,
                timer: action.timer
            };
        case RUN_BREAK:
            return {
                ...state,
                timerType: action.timerType,
                timer: action.timer
            };
        case PAUSER:
            return {
                ...state,
                timerPaused: action.timerPaused
            };
        case RESUME:
            return {
                ...state,
                timerPaused: action.timerPaused
            };
        case RESET:
            return defaultState;
        case ADJ_VOL:
            return {
                ...state,
                volume: action.volume
            };
        case RING_PROG:
            return {
                ...state,
                ringProg: action.ringProg
            };
        default:
            return state;
    };
};

//store
const defaultState = {
    sessionLength: 25,
    breakLength: 5,
    timerPaused: true,
    timerType: "Session",
    timer: 1500,
    volume: 0.5,
    ringProg: 1
};

const store = createStore(TimerReducer, applyMiddleware(thunk)); 

//react
//app
const App = () => {
    return (
        <Provider store={store}>
            <TimerAppApp />
        </Provider>
    );
};

const Adjustment = props => {
    return (
        <div className={props.class}>
        <div id={props.labelId}>{props.labelStr}</div>
        <div className="timeAdjCtrl">
            <div id={props.decrementId} className="ctrlbtn" 
                onClick={props.onClick}>
                -
            </div>
            <div id={props.lengthId}>
                {props.lengthVal}
            </div>
            <div id={props.incrementId}  className="ctrlbtn" 
                onClick={props.onClick}>
                +
            </div>
        </div>
    </div>
    );
};

const Timer = props => {
    const radius = props.radius - props.stroke * 2;
    const circum = radius*2  * Math.PI;
    const strokeDashoffset = -(1-props.ringProg)*circum;
    return (
        <div className="timer">
            <svg className="prog-ring" height="300" width="300">
                <circle
                    className="prog-ring_circle"
                    stroke={props.strokeColor}
                    fill="transparent"
                    stroke-width={props.stroke}
                    strokeDasharray={circum+" "+circum}
                    style={{ strokeDashoffset }}
                    r={radius}
                    cx={props.radius}
                    cy={props.radius}
                />
                {/*background circle*/}
                <circle
                    className="prog-ring_circle"
                    stroke={props.strokeColor}
                    strokeOpacity="20%"
                    fill="transparent"
                    stroke-width={props.stroke}
                    strokeDasharray={circum+" "+circum}
                    r={radius}
                    cx={props.radius}
                    cy={props.radius}
                />
            </svg>
            <div id="timer-label" className="timertxt"
                style={props.txtcolor}>
                {props.timerType}
            </div>
            <div id="time-left" className="timertxt"
                style={props.txtcolor}>
                {props.timer}
            </div>
        </div>
    );
};

const TimerCtrl = props => {
    return (
        <div className="ctrlTimer">
            <div id="start_stop" class="ctrlTimerBtn"
                onClick={props.onClick}>
                {props.startstop}
            </div>
            <div id="reset" class="ctrlTimerBtn"
                onClick={props.onClick}>
                RESET
            </div>
        </div>
    );
};

const Sound = props => {
    return (
        <div className="sound">
            <input
                max="1"
                min="0"
                onChange={props.onChange}
                onMouseUp={props.onMouseUp}
                onMouseOver={props.onMouseOver}
                onMouseOut={props.onMouseOut}
                step="0.01"
                type="range"
                value={props.value}
            />
            <div id="vol-val" className="">Volume: {props.vol}</div>
            <audio
                id="beep"
                preload="auto"
                src="https://freesound.org/data/previews/452/452676_7411284-lq.mp3"
            />
        </div>    
    );
};

class TimerApp extends React.Component {

    convertTime = val => {
        let mins = ~~((val % 3600) / 60);
        let secs = ~~val % 60;
    
        let output = "";
        if (val===3600) {
            output = "60:00";
        } else
        output = (mins < 10 ? "0" : "") + mins + ":" + (secs < 10 ? "0" : "") + secs;
        return output;
    };

    handleClick = event => {
        const {setSession, sessionLength, setBreak, breakLength, 
            timerPaused, resume, pauser, reset} = this.props;
        switch (event.target.id) {
            case "session-decrement":
                if (sessionLength > 1) {
                setSession("decrease");
                };
                break;
            case "session-increment":
                if (sessionLength < 60) {
                setSession("increase");
                };
                break;
            case "break-decrement":
                if (breakLength > 1) {
                setBreak("decrease");
                };
                break;
            case "break-increment":
                if (breakLength < 60) {
                setBreak("increase");
                };
                break;
            case "start_stop":
                timerPaused ? resume():pauser();
                break;
            case "reset":
                reset();
                break;
            default:
                break;
        };
    };
    
    setClass = () => {
        let elem = document.getElementById("vol-val");
        elem.classList.toggle("visible");
    };

    render () { 
        const {sessionLength, breakLength, timerType, timerPaused,
            timer, volume, adjVol, ringProg} = this.props;
        return (         
            <div id="timerApp">
                <div class="timeAdj">
                    <Adjustment 
                        class="session"
                        labelId="session-label"
                        labelStr="Session"
                        decrementId="session-decrement"
                        lengthId="session-length"
                        lengthVal={sessionLength < 10 ? 
                                    "0"+sessionLength:sessionLength}
                        incrementId="session-increment"
                        onClick={this.handleClick}
                    />
                    <Adjustment 
                        class="break"
                        labelId="break-label"
                        labelStr="Break"
                        decrementId="break-decrement"
                        lengthId="break-length"
                        lengthVal={breakLength < 10 ?
                                    "0"+breakLength:breakLength}
                        incrementId="break-increment"
                        onClick={this.handleClick}
                    />
                </div>
                <Timer 
                    timerType={timerType}
                    timer={this.convertTime(timer)}
                    ringProg={ringProg}
                    radius="150"
                    stroke="4"
                    strokeColor={ringProg > 0.2 ? 
                                    "white" :
                                        ringProg <= 0.1 ?
                                            "limegreen" : "yellow"
                        
                    }
                    txtcolor={ringProg > 0.2 ? 
                                {color:"white"} :
                                    ringProg <= 0.1 ?
                                        {color:"limegreen"} : {color:"yellow"}
                    }
                />
                <TimerCtrl
                    onClick={this.handleClick}
                    startstop={timerPaused ?
                                "Start":"Pause"}
                />
                <Sound 
                    onChange={adjVol}
                    onMouseUp={playSound}
                    value={volume}
                    vol={volume < 0.1 ? 
                        "0"+parseInt(volume*100):parseInt(volume*100)}
                    onMouseOver={this.setClass}
                    onMouseOut={this.setClass}
                />
                <p>Pomodoro Timer by Jackie Lam | 25 Jul 2021</p>
            </div>
        );
    };
};

//react-redux
const mapStateToProps = state => {
    return {
        sessionLength: state.sessionLength,
        breakLength: state.breakLength,
        timerPaused: state.timerPaused,
        timerType: state.timerType,
        timer: state.timer,
        volume: state.volume,
        ringProg: state.ringProg
    };
};

const mapDispatchToProps = dispatch => {
    return {
        setSession: e => dispatch(setSession(e)),
        setBreak: e => dispatch(setBreak(e)),
        runSession: () => dispatch(runSession()),
        runBreak: () => dispatch(runBreak()),
        pauser: () => dispatch(pauser()),
        resume: () => dispatch(resume()),
        reset: () => dispatch(reset()),
        adjVol: event =>  dispatch(adjVol(event)),
        setRingProg: val => dispatch(setRingProg(val))
    };
};
  
const TimerAppApp = connect(mapStateToProps, mapDispatchToProps)(TimerApp);

ReactDOM.render(<App />, document.getElementById("root"));
export default App;
