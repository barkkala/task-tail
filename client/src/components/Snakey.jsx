import { useEffect, useRef } from "react";

const BASE_CREATURE_LEGS = 1;
const CREATURE_SIZE = 1;
const HEAD_SIZE = 10;
const HIDDEN_NECK_SEGMENTS = 7;

function getCreatureTail(legs) {
    return Math.max(18, legs * 8 + 4);
}

function getHeadSize(completedTasks) {
    return HEAD_SIZE + Math.floor(completedTasks / 2) * 0.25;
}

const skinPalettes = {
    green: {
        outline: "#14532d",
        body: "#86efac",
        bodyLight: "#bbf7d0",
        bodyDark: "#22c55e",
    },
    red: {
        outline: "#7f1d1d",
        body: "#fca5a5",
        bodyLight: "#fecaca",
        bodyDark: "#ef4444",
        belly: "#fee2e2",
    },
    pink: {
        outline: "#831843",
        body: "#f9a8d4",
        bodyLight: "#fbcfe8",
        bodyDark: "#ec4899",
        belly: "#fce7f3",
    },
    blue: {
        outline: "#1e3a8a",
        body: "#93c5fd",
        bodyLight: "#bfdbfe",
        bodyDark: "#3b82f6",
        belly: "#dbeafe",
    },
    orange: {
        outline: "#7c2d12",
        body: "#fdba74",
        bodyLight: "#fed7aa",
        bodyDark: "#f97316",
        belly: "#ffedd5",
    },
};

export default function Snakey({
    mode = "cursor",
    completedTasks = 0,
    legStyle = "round",
    headStyle = "oval",
    skinColor = "green",
}) {
    const canvasRef = useRef(null);
    const safeCompletedTasks = Math.max(0, Number(completedTasks) || 0);
    const creatureLegs = BASE_CREATURE_LEGS + Math.floor(safeCompletedTasks / 2);
    const creatureHeadSize = getHeadSize(safeCompletedTasks);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let animationId;
        let critter;

        const input = {
            mouse: {
                x: 0,
                y: 0,
            },
        };

                const selectedPalette = skinPalettes[skinColor] || skinPalettes.green;

        const colors = {
            ...selectedPalette,
            eye: "#ffffff",
            pupil: "#1f2937",
            tongue: "#f43f5e",
            toe: "#fde68a",
            backgroundTop: "#fff7ed",
            backgroundBottom: "#dcfce7",
        };

        const setCanvasSize = () => {
            if (mode === "cursor") {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                return;
            }

            const parent = canvas.parentElement;
            const rect = parent.getBoundingClientRect();

            canvas.width = rect.width;
            canvas.height = rect.height;
        };

        const drawBackground = () => {
            if (mode === "cursor") {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }

            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, colors.backgroundTop);
            gradient.addColorStop(1, colors.backgroundBottom);

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        };

        const handleMouseMove = (event) => {
            if (mode !== "cursor") {
                return;
            }

            input.mouse.x = event.clientX;
            input.mouse.y = event.clientY;
        };

        const drawTriangleSegment = (from, to, width, fillStyle) => {
            const angle = Math.atan2(to.y - from.y, to.x - from.x);
            const sideX = Math.cos(angle + Math.PI / 2);
            const sideY = Math.sin(angle + Math.PI / 2);

            ctx.beginPath();
            ctx.moveTo(to.x, to.y);
            ctx.lineTo(from.x + sideX * width, from.y + sideY * width);
            ctx.lineTo(from.x - sideX * width, from.y - sideY * width);
            ctx.closePath();
            ctx.fillStyle = fillStyle;
            ctx.fill();
            ctx.strokeStyle = colors.outline;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        };

        class Segment {
            constructor(parent, size, angle, range, stiffness) {
                this.isSegment = true;
                this.parent = parent;

                if (typeof parent.children === "object") {
                    parent.children.push(this);
                }

                this.children = [];
                this.size = size;
                this.relAngle = angle;
                this.defAngle = angle;
                this.absAngle = parent.absAngle + angle;
                this.range = range;
                this.stiffness = stiffness;
                this.depth = (parent.depth || 0) + 1;
                this.updateRelative(false, true);
            }

            updateRelative(iter, flex) {
                this.relAngle =
                    this.relAngle -
                    2 *
                        Math.PI *
                        Math.floor((this.relAngle - this.defAngle) / 2 / Math.PI + 1 / 2);

                if (flex) {
                    this.relAngle = Math.min(
                        this.defAngle + this.range / 2,
                        Math.max(
                            this.defAngle - this.range / 2,
                            (this.relAngle - this.defAngle) / this.stiffness + this.defAngle
                        )
                    );
                }

                this.absAngle = this.parent.absAngle + this.relAngle;
                this.x = this.parent.x + Math.cos(this.absAngle) * this.size;
                this.y = this.parent.y + Math.sin(this.absAngle) * this.size;

                if (iter) {
                    for (let i = 0; i < this.children.length; i += 1) {
                        this.children[i].updateRelative(iter, flex);
                    }
                }
            }

            draw(iter) {
                if (this.depth <= HIDDEN_NECK_SEGMENTS) {
                    if (iter) {
                        for (let i = 0; i < this.children.length; i += 1) {
                            this.children[i].draw(true);
                        }
                    }

                    return;
                }

                const progress = Math.min(this.depth / 120, 1);
                const isLeg = this.size > 10;
                const isTinyToe = this.size <= 2;
                const isToe = !isLeg && this.children.length === 0 && this.parent.size > 10;
                const lineWidth = isLeg
                    ? Math.max(2.2, this.size * 0.16)
                    : Math.max(2, this.size * (1.15 - progress * 0.45));
                const bodyColor = progress > 0.65 ? colors.bodyLight : colors.body;

                if (legStyle === "none" && (isLeg || isToe)) {
                    return;
                }

                ctx.save();
                ctx.lineCap = "round";
                ctx.lineJoin = "round";

                if (isLeg && legStyle === "triangle") {
                    drawTriangleSegment(this.parent, this, Math.max(5, lineWidth * 2), bodyColor);

                    ctx.restore();

                    if (iter) {
                        for (let i = 0; i < this.children.length; i += 1) {
                            this.children[i].draw(true);
                        }
                    }

                    return;
                }

                ctx.beginPath();
                ctx.moveTo(this.parent.x, this.parent.y);
                ctx.lineTo(this.x, this.y);
                ctx.strokeStyle = colors.outline;
                ctx.lineWidth = lineWidth + (isLeg ? 1.8 : 4);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(this.parent.x, this.parent.y);
                ctx.lineTo(this.x, this.y);
                ctx.strokeStyle = bodyColor;
                ctx.lineWidth = lineWidth;
                ctx.stroke();

                if (!isLeg && this.depth % 4 === 0) {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, Math.max(1.8, lineWidth * 0.28), 0, Math.PI * 2);
                    ctx.fillStyle = colors.belly;
                    ctx.fill();
                }

                if ((isLeg || isTinyToe) && this.children.length === 0) {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, isTinyToe ? 1.8 : 2.4, 0, Math.PI * 2);
                    ctx.fillStyle = colors.toe;
                    ctx.fill();
                    ctx.strokeStyle = colors.outline;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }

                if (this.tailProgress > 0.94) {
                    const angle = Math.atan2(this.y - this.parent.y, this.x - this.parent.x);
                    const tipLength = 5;
                    const baseWidth = 1;
                    const tipX = this.x + Math.cos(angle) * tipLength;
                    const tipY = this.y + Math.sin(angle) * tipLength;
                    const sideX = Math.cos(angle + Math.PI / 2);
                    const sideY = Math.sin(angle + Math.PI / 2);

                    ctx.beginPath();
                    ctx.moveTo(tipX, tipY);
                    ctx.lineTo(this.x + sideX * baseWidth, this.y + sideY * baseWidth);
                    ctx.lineTo(this.x - sideX * baseWidth, this.y - sideY * baseWidth);
                    ctx.closePath();
                    ctx.fillStyle = colors.bodyLight;
                    ctx.fill();
                    ctx.strokeStyle = colors.outline;
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                }

                ctx.restore();

                if (iter) {
                    for (let i = 0; i < this.children.length; i += 1) {
                        this.children[i].draw(true);
                    }
                }
            }

            follow(iter) {
                const x = this.parent.x;
                const y = this.parent.y;
                const dist = ((this.x - x) ** 2 + (this.y - y) ** 2) ** 0.5 || 1;

                this.x = x + (this.size * (this.x - x)) / dist;
                this.y = y + (this.size * (this.y - y)) / dist;
                this.absAngle = Math.atan2(this.y - y, this.x - x);
                this.relAngle = this.absAngle - this.parent.absAngle;
                this.updateRelative(false, true);

                if (iter) {
                    for (let i = 0; i < this.children.length; i += 1) {
                        this.children[i].follow(true);
                    }
                }
            }
        }

        class LimbSystem {
            constructor(end, length, speed, creature) {
                this.end = end;
                this.length = Math.max(1, length);
                this.creature = creature;
                this.speed = speed;
                creature.systems.push(this);
                this.nodes = [];

                let node = end;

                for (let i = 0; i < length; i += 1) {
                    this.nodes.unshift(node);
                    node = node.parent;

                    if (!node.isSegment) {
                        this.length = i + 1;
                        break;
                    }
                }

                this.hip = this.nodes[0].parent;
            }

            moveTo(x, y) {
                this.nodes[0].updateRelative(true, true);

                const dist = ((x - this.end.x) ** 2 + (y - this.end.y) ** 2) ** 0.5;
                let len = Math.max(0, dist - this.speed);
                let targetX = x;
                let targetY = y;

                for (let i = this.nodes.length - 1; i >= 0; i -= 1) {
                    const node = this.nodes[i];
                    const angle = Math.atan2(node.y - targetY, node.x - targetX);

                    node.x = targetX + len * Math.cos(angle);
                    node.y = targetY + len * Math.sin(angle);
                    targetX = node.x;
                    targetY = node.y;
                    len = node.size;
                }

                for (let i = 0; i < this.nodes.length; i += 1) {
                    const node = this.nodes[i];

                    node.absAngle = Math.atan2(node.y - node.parent.y, node.x - node.parent.x);
                    node.relAngle = node.absAngle - node.parent.absAngle;

                    for (let ii = 0; ii < node.children.length; ii += 1) {
                        const childNode = node.children[ii];

                        if (!this.nodes.includes(childNode)) {
                            childNode.updateRelative(true, false);
                        }
                    }
                }
            }

            update() {
                this.moveTo(input.mouse.x, input.mouse.y);
            }
        }

        class LegSystem extends LimbSystem {
            constructor(end, length, speed, creature) {
                super(end, length, speed, creature);
                this.goalX = end.x;
                this.goalY = end.y;
                this.step = 0;
                this.forwardness = 0;
                this.reach =
                    0.9 *
                    ((this.end.x - this.hip.x) ** 2 + (this.end.y - this.hip.y) ** 2) ** 0.5;

                let relAngle =
                    this.creature.absAngle -
                    Math.atan2(this.end.y - this.hip.y, this.end.x - this.hip.x);

                relAngle -= 2 * Math.PI * Math.floor(relAngle / 2 / Math.PI + 1 / 2);

                this.swing = -relAngle + (2 * (relAngle < 0) - 1) * Math.PI / 2;
                this.swingOffset = this.creature.absAngle - this.hip.absAngle;
            }

            update() {
                this.moveTo(this.goalX, this.goalY);

                if (this.step === 0) {
                    const dist =
                        ((this.end.x - this.goalX) ** 2 + (this.end.y - this.goalY) ** 2) **
                        0.5;

                    if (dist > 1) {
                        this.step = 1;
                        this.goalX =
                            this.hip.x +
                            this.reach *
                                Math.cos(this.swing + this.hip.absAngle + this.swingOffset) +
                            ((2 * Math.random() - 1) * this.reach) / 2;
                        this.goalY =
                            this.hip.y +
                            this.reach *
                                Math.sin(this.swing + this.hip.absAngle + this.swingOffset) +
                            ((2 * Math.random() - 1) * this.reach) / 2;
                    }
                } else if (this.step === 1) {
                    const theta =
                        Math.atan2(this.end.y - this.hip.y, this.end.x - this.hip.x) -
                        this.hip.absAngle;
                    const dist =
                        ((this.end.x - this.hip.x) ** 2 + (this.end.y - this.hip.y) ** 2) **
                        0.5;
                    const forwardness2 = dist * Math.cos(theta);
                    const dF = this.forwardness - forwardness2;

                    this.forwardness = forwardness2;

                    if (dF * dF < 1) {
                        this.step = 0;
                        this.goalX = this.hip.x + (this.end.x - this.hip.x);
                        this.goalY = this.hip.y + (this.end.y - this.hip.y);
                    }
                }
            }
        }

        class Creature {
            constructor(
                x,
                y,
                angle,
                headSize,
                fAccel,
                fFric,
                fRes,
                fThresh,
                rAccel,
                rFric,
                rRes,
                rThresh
            ) {
                this.x = x;
                this.y = y;
                this.headSize = headSize;
                this.absAngle = angle;
                this.fSpeed = 0;
                this.fAccel = fAccel;
                this.fFric = fFric;
                this.fRes = fRes;
                this.fThresh = fThresh;
                this.rSpeed = 0;
                this.rAccel = rAccel;
                this.rFric = rFric;
                this.rRes = rRes;
                this.rThresh = rThresh;
                this.children = [];
                this.systems = [];
            }

            follow(x, y) {
                const dist = ((this.x - x) ** 2 + (this.y - y) ** 2) ** 0.5;
                const angle = Math.atan2(y - this.y, x - this.x);

                let accel = this.fAccel;

                if (this.systems.length > 0) {
                    let sum = 0;

                    for (let i = 0; i < this.systems.length; i += 1) {
                        sum += this.systems[i].step === 0;
                    }

                    accel *= sum / this.systems.length;
                }

                this.fSpeed += accel * (dist > this.fThresh);
                this.fSpeed *= 1 - this.fRes;
                this.speed = Math.max(0, this.fSpeed - this.fFric);

                let dif = this.absAngle - angle;
                dif -= 2 * Math.PI * Math.floor(dif / (2 * Math.PI) + 1 / 2);

                if (Math.abs(dif) > this.rThresh && dist > this.fThresh) {
                    this.rSpeed -= this.rAccel * (2 * (dif > 0) - 1);
                }

                this.rSpeed *= 1 - this.rRes;

                if (Math.abs(this.rSpeed) > this.rFric) {
                    this.rSpeed -= this.rFric * (2 * (this.rSpeed > 0) - 1);
                } else {
                    this.rSpeed = 0;
                }

                this.absAngle += this.rSpeed;
                this.absAngle -=
                    2 * Math.PI * Math.floor(this.absAngle / (2 * Math.PI) + 1 / 2);
                this.x += this.speed * Math.cos(this.absAngle);
                this.y += this.speed * Math.sin(this.absAngle);
                this.absAngle += Math.PI;

                for (let i = 0; i < this.children.length; i += 1) {
                    this.children[i].follow(true);
                }

                for (let i = 0; i < this.systems.length; i += 1) {
                    this.systems[i].update(x, y);
                }

                this.absAngle -= Math.PI;
                this.draw(true);
            }

            draw(iter) {
                const r = this.headSize;
                const sideX = Math.cos(this.absAngle + Math.PI / 2);
                const sideY = Math.sin(this.absAngle + Math.PI / 2);
                const forwardX = Math.cos(this.absAngle);
                const forwardY = Math.sin(this.absAngle);
                const eyeForwardX = forwardX * r * 0.3;
                const eyeForwardY = forwardY * r * 0.3;
                const eyeSideOffset = r * 0.5;
                const eyeRadius = r * 0.42;
                const pupilForwardOffset = r * 0.12;
                const pupilRadius = r * 0.18;
                const tongueStartOffset = r * 1.15;
                const tongueLength = r * 0.45;
                const tongueForkLength = r * 0.16;
                const tongueForkSpread = r * 0.12;
                const tongueStartX = this.x + forwardX * tongueStartOffset;
                const tongueStartY = this.y + forwardY * tongueStartOffset;
                const tongueEndX = tongueStartX + forwardX * tongueLength;
                const tongueEndY = tongueStartY + forwardY * tongueLength;

                ctx.save();
                ctx.lineCap = "round";
                ctx.lineJoin = "round";

                                ctx.beginPath();

                if (headStyle === "triangle") {
                    const tipX = this.x + forwardX * r * 1.5;
                    const tipY = this.y + forwardY * r * 1.5;
                    const backX = this.x - forwardX * r * 1.05;
                    const backY = this.y - forwardY * r * 1.05;

                    ctx.moveTo(tipX, tipY);
                    ctx.lineTo(backX + sideX * r * 1.05, backY + sideY * r * 1.05);
                    ctx.lineTo(backX - sideX * r * 1.05, backY - sideY * r * 1.05);
                    ctx.closePath();
                } else if (headStyle === "square") {
                    const frontX = forwardX * r * 1.1;
                    const frontY = forwardY * r * 1.1;
                    const sideOffsetX = sideX * r * 1.05;
                    const sideOffsetY = sideY * r * 1.05;

                    ctx.moveTo(this.x + frontX + sideOffsetX, this.y + frontY + sideOffsetY);
                    ctx.lineTo(this.x + frontX - sideOffsetX, this.y + frontY - sideOffsetY);
                    ctx.lineTo(this.x - frontX - sideOffsetX, this.y - frontY - sideOffsetY);
                    ctx.lineTo(this.x - frontX + sideOffsetX, this.y - frontY + sideOffsetY);
                    ctx.closePath();
                } else if (headStyle === "circle") {
                    ctx.arc(this.x, this.y, r * 1.15, 0, Math.PI * 2);
                } else {
                    ctx.ellipse(this.x, this.y, r * 1.25, r, this.absAngle, 0, Math.PI * 2);
                }

                ctx.fillStyle = colors.bodyDark;
                ctx.fill();
                ctx.strokeStyle = colors.outline;
                ctx.lineWidth = Math.max(1, r * 0.4);
                ctx.stroke();

                for (const side of [-1, 1]) {
                    const eyeX = this.x + sideX * side * eyeSideOffset + eyeForwardX;
                    const eyeY = this.y + sideY * side * eyeSideOffset + eyeForwardY;

                    ctx.beginPath();
                    ctx.arc(eyeX, eyeY, eyeRadius, 0, Math.PI * 2);
                    ctx.fillStyle = colors.eye;
                    ctx.fill();
                    ctx.strokeStyle = colors.outline;
                    ctx.lineWidth = Math.max(0.75, r * 0.15);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.arc(
                        eyeX + forwardX * pupilForwardOffset,
                        eyeY + forwardY * pupilForwardOffset,
                        pupilRadius,
                        0,
                        Math.PI * 2
                    );
                    ctx.fillStyle = colors.pupil;
                    ctx.fill();
                }

                ctx.beginPath();
                ctx.moveTo(tongueStartX, tongueStartY);
                ctx.lineTo(tongueEndX, tongueEndY);
                ctx.moveTo(tongueEndX, tongueEndY);
                ctx.lineTo(
                    tongueEndX + forwardX * tongueForkLength + sideX * tongueForkSpread,
                    tongueEndY + forwardY * tongueForkLength + sideY * tongueForkSpread
                );
                ctx.moveTo(tongueEndX, tongueEndY);
                ctx.lineTo(
                    tongueEndX + forwardX * tongueForkLength - sideX * tongueForkSpread,
                    tongueEndY + forwardY * tongueForkLength - sideY * tongueForkSpread
                );
                ctx.strokeStyle = colors.tongue;
                ctx.lineWidth = Math.max(1.1, r * 0.14);
                ctx.stroke();
                ctx.restore();

                if (iter) {
                    for (let i = 0; i < this.children.length; i += 1) {
                        this.children[i].draw(true);
                    }
                }
            }
        }

        const setupLizard = (size, legs, tail) => {
            const s = size;
            const critterStartX = canvas.width / 2;
            const critterStartY = mode === "cursor" ? canvas.height / 2 : canvas.height * 0.64;
            const critterStartAngle = mode === "cursor" ? 0 : -Math.PI / 2;

            const newCritter = new Creature(
                critterStartX,
                critterStartY,
                critterStartAngle,
                creatureHeadSize,
                s * 10,
                s * 2,
                0.5,
                16,
                0.5,
                0.085,
                0.5,
                0.3
            );

            let spinal = newCritter;

            for (let i = 0; i < 6; i += 1) {
                spinal = new Segment(spinal, s * 4, 0, (3.1415 * 2) / 3, 1.1);

                for (let ii = -1; ii <= 1; ii += 2) {
                    let node = new Segment(spinal, s * 3, ii, 0.1, 2);

                    for (let iii = 0; iii < 3; iii += 1) {
                        node = new Segment(node, s * 0.1, -ii * 0.1, 0.1, 2);
                    }
                }
            }

            for (let i = 0; i < legs; i += 1) {
                if (i > 0) {
                    for (let ii = 0; ii < 10 ; ii += 1) {
                        spinal = new Segment(spinal, s * 4, 0, 1.571, 1.5);

                        for (let iii = -1; iii <= 1; iii += 2) {
                            let node = new Segment(spinal, s * 3, iii * 1.571, 0.1, 1.5);

                            for (let iv = 0; iv < 3; iv += 1) {
                                node = new Segment(node, s * 3, -iii * 0.3, 0.1, 2);
                            }
                        }
                    }
                }

                for (let ii = -1; ii <= 1; ii += 2) {
                    let node = new Segment(spinal, s * 12, ii * 0.785, 0, 8);
                    node = new Segment(node, s * 16, -ii * 0.785, 6.28, 1);
                    node = new Segment(node, s * 16, ii * 1.571, 3.1415, 2);

                    for (let iii = 0; iii < 4; iii += 1) {
                        new Segment(node, s * 4, (iii / 3 - 0.5) * 1.571, 0.1, 4);
                    }

                    new LegSystem(node, 3, s * 12, newCritter);
                }
            }

            for (let i = 0; i < tail; i += 1) {
                spinal = new Segment(spinal, s * 4, 0, (3.1415 * 2) / 3, 1.1);
                spinal.tailProgress = (i + 1) / tail;

                for (let ii = -1; ii <= 1; ii += 2) {
                    let node = new Segment(spinal, s * 3, ii, 0.1, 2);
                    node.tailProgress = (i + 1) / tail;

                    for (let iii = 0; iii < 3; iii += 1) {
                        node = new Segment(
                            node,
                            (s * 3 * (tail - i)) / tail,
                            -ii * 0.1,
                            0.1,
                            2
                        );
                        node.tailProgress = (i + 1) / tail;
                    }
                }
            }
            return newCritter;
        };

        const resetAutoSnake = () => {
            input.mouse.x = canvas.width * 0.5;
            input.mouse.y = canvas.height * 0.16;
            critter = setupLizard(CREATURE_SIZE, creatureLegs, getCreatureTail(creatureLegs));
        };

        setCanvasSize();
        ctx.strokeStyle = colors.outline;
        ctx.lineWidth = 3;

        input.mouse.x = canvas.width / 2;
        input.mouse.y = canvas.height / 2;

        if (mode === "auto") {
            resetAutoSnake();
        } else {
            critter = setupLizard(CREATURE_SIZE, creatureLegs, getCreatureTail(creatureLegs));
        }

        const animate = () => {
            drawBackground();

            if (mode === "auto") {
                const anchorX = canvas.width * 0.5;
                const anchorY = canvas.height * 0.3;

                input.mouse.x = canvas.width * 0.5;
                input.mouse.y = critter.y - canvas.height;

                ctx.save();

                ctx.translate(anchorX, anchorY);
                ctx.scale(2.4, 2.4);
                ctx.translate(-critter.x, -critter.y);

                critter.follow(input.mouse.x, input.mouse.y);

                ctx.restore();
            } else {
                critter.follow(input.mouse.x, input.mouse.y);
            }

            animationId = requestAnimationFrame(animate);
        };

        const handleResize = () => {
            setCanvasSize();

            if (mode === "auto") {
                resetAutoSnake();
            }
        };

        window.addEventListener("resize", handleResize);
        document.addEventListener("mousemove", handleMouseMove);

        animate();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener("resize", handleResize);
            document.removeEventListener("mousemove", handleMouseMove);
        };
        }, [mode, creatureLegs, creatureHeadSize, legStyle, headStyle, skinColor]);

    return (
        <canvas
            ref={canvasRef}
            style={mode === "cursor" ? styles.cursorCanvas : styles.editorCanvas}
        />
    );
}

const styles = {
    cursorCanvas: {
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        display: "block",
        pointerEvents: "none",
        zIndex: 0,
    },
    editorCanvas: {
        width: "100%",
        height: "100%",
        display: "block",
        background: "#fff7ed",
        pointerEvents: "none",
    },
};



/**
 * ИСТОЧНИК И ПРОИСХОЖДЕНИЕ МЕХАНИКИ
 * 
 * Основа движения рептилии и отслеживания полностью взята из открытого проекта
 * ReptileInteractiveCursor:
 * https://github.com/codetoanbug/ReptileInteractiveCursor
 */