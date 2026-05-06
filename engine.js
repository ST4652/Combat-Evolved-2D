        //////////////////////////
        // TEXTÚRY
        //////////////////////////
        const dmrPlayerImg = new Image();
        dmrPlayerImg.src = "masta chif dmr.png";

        const arPlayerImg = new Image();
        arPlayerImg.src = "masta chir ar.png";

        const gruntImg = new Image();
        gruntImg.src = "grunt 16x16 v2.png";

        const eliteImg = new Image();
        eliteImg.src = "elite blue 16x16 v2.png";




        const hudFont = new FontFace(
            "HaloFont",
            "url(HaloReachMenu.ttf)"
        );

        hudFont.load().then(font => {

            document.fonts.add(font);
        });

        ////////////
        //zbrane    pif paf
        //////////

        let weapons = {
            dmr: {
                damage: 2,
                bulletSpeed: 14,
                fireRate: 320, // ms medzi výstrelmi
                spread: 0.08,
                automatic: false,
                reloadTime: 1300,
                magSize: 12,
                color: "#ffd000"
            },

            ar: {
                damage: 0.8,               //0.8
                bulletSpeed: 11,
                fireRate: 140,              //140
                spread: 0.19,             //0.16
                automatic: true,
                reloadTime: 2200,
                magSize: 36,              //36
                color: "#ff8800"
            }
        };






//////////////////////////
// OBTIAŽNOSŤ
//////////////////////////

let difficulty = "legendary";
// "normal"
// "heroic"

const difficulties = {

    easy: {
        playerHp: 90,
        enemySpeed: 0.85,
        enemyAccuracy: 0.28,
        enemyFireRate: 1.3,
        enemyActivateDist: 500,
        regenDelay: 2500,
        regenSpeed: 0.14,
        weaponDamageMultiplier: 1.2
    },

    normal: {
        playerHp: 70,
        enemySpeed: 1,
        enemyAccuracy: 0.18,
        enemyFireRate: 1,
        enemyActivateDist: 620,
        regenDelay: 3500,
        regenSpeed: 0.10,
        weaponDamageMultiplier: 1
    },

    heroic: {
        playerHp: 55,
        enemySpeed: 1.25,
        enemyAccuracy: 0.10,
        enemyFireRate: 0.82,
        enemyActivateDist: 820,
        regenDelay: 5000,
        regenSpeed: 0.06,
        weaponDamageMultiplier: 0.92
    },

    legendary: {
        playerHp: 40,
        enemySpeed: 1.45,
        enemyAccuracy: 0.05,
        enemyFireRate: 0.65,
        enemyActivateDist: 1000,
        regenDelay: 7000,
        regenSpeed: 0.03,
        weaponDamageMultiplier: 0.85
    }
};

const diff = difficulties[difficulty];



        //////////////////////////
        // HRÁČ
        //////////////////////////

        let player = {
            x: 500,        //500 obidve
            y: 500,
            size: 80,
            speed: 2.0,     //2.0 dat potom
            angle: 0,

            hp: diff.playerHp,     //70bolo
            maxHp: diff.playerHp,
            lastHitTime: 0,
            lastHitTime: Date.now(),

            weapon: "ar",
            ammo: {
                dmr: 12,
                ar: 36
            },
            reloading: false,
            lastShot: 0,
        };







        const hpBar = {

            width: 400,
            height: 22,

            backgroundColor: "rgba(80,80,80,0.6)",
            hpColor: "rgba(115,210,255,0.92)",

            borderColor: "white",

            y: 30
        };
        ///////////
        //fps/rychlosr oprava
        ///////////
        let lastTime = 0;

        function gameLoop(timestamp) {

            let delta = (timestamp - lastTime) / 16.67;

            lastTime = timestamp;

            updatePlayer(delta);

            requestAnimationFrame(gameLoop);
        }




        //regeneracia zivotov
        function regenerateHp() {

            // 3 sekundy bez damage
            if (Date.now() - player.lastHitTime > diff.regenDelay) {

                player.hp += diff.regenSpeed;

                // max hp limit
                if (player.hp > player.maxHp) {
                    player.hp = player.maxHp;
                }
            }
        }







         let keys = {};
        document.addEventListener("keydown", e => keys[e.key] = true);
        document.addEventListener("keyup", e => keys[e.key] = false);

        let mouse = { x: 0, y: 0 };
        canvas.addEventListener("mousemove", e => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        //////////////////////////
        // STRELY
        //////////////////////////
        let bullets = [];

        canvas.addEventListener("click", () => {

            if (!weapons[player.weapon].automatic) {
                shoot();
            }
        });

        ///////////////////
        //automaticke stielanie
        ///////////////
        let mouseDown = false;

        canvas.addEventListener("mousedown", () => {
            mouseDown = true;
        });

        canvas.addEventListener("mouseup", () => {
            mouseDown = false;
        });






        function shoot() {

            if (dying) return;

            let weapon = weapons[player.weapon];

            if (player.reloading) return;

            if (player.ammo[player.weapon] <= 0) {

                reloadWeapon();
                return;
            }

            let now = Date.now();

            if (now - player.lastShot < weapon.fireRate) return;

            player.lastShot = now;

            player.ammo[player.weapon]--;

            let angle = Math.atan2(
                mouse.y - canvas.height / 2,
                mouse.x - canvas.width / 2
            );

            angle += (Math.random() - 0.5) * weapon.spread;

            bullets.push({

                x: player.x,
                y: player.y,

                dx: Math.cos(angle) * weapon.bulletSpeed,
                dy: Math.sin(angle) * weapon.bulletSpeed,

                size: 10,

                from: "player",

                damage: weapon.damage * diff.weaponDamageMultiplier,

                life: 80
            });
        }









        function reloadWeapon() {

            if (player.reloading) return;

            player.reloading = true;

            setTimeout(() => {

                player.ammo[player.weapon] =
                    weapons[player.weapon].magSize;

                player.reloading = false;

            }, weapons[player.weapon].reloadTime);
        }






        //tlacitka na menenie zbrani

        document.addEventListener("keydown", e => {

            if (e.key === "+") {

                player.weapon = "dmr";

            }

            if (e.key === "ľ") {

                player.weapon = "ar";

            }
        });
        document.addEventListener("keydown", e => {

            if (e.key.toLowerCase() === "r") {

                reloadWeapon();
            }
        });


        ////////////
        //hud
        //////////
        function drawAmmo() {

            let weapon = weapons[player.weapon];

            ctx.font = "32px 'Press Start 2P'";
            ctx.textAlign = "right";

            ctx.fillStyle = "white";

            ctx.shadowColor = "black";
            ctx.shadowBlur = 8;

            ctx.fillText(
                `${player.ammo[player.weapon]}/${weapon.magSize}`,
                canvas.width - 40,
                50
            );

            if (player.reloading) {

                ctx.fillStyle = "#66ccff";

                ctx.fillText(
                    "RELOADING",
                    canvas.width - 40,
                    90
                );
            }

            ctx.shadowBlur = 0;
        }



  const bloodImg = new Image();
        bloodImg.src = "blood v3.png";   //v3 asi nejlepsie

        const gruntDeadImg = new Image();
        gruntDeadImg.src = "grunt dead 16x16.png";

        const eliteDeadImg = new Image();
        eliteDeadImg.src = "elite blue dead 16x16.png";




   function drawCheckpointText() {

            if (Date.now() - checkpointMsgTime < 2000) {

                ctx.font = "20px 'Press Start 2P'";
                ctx.fillStyle = "white";
                ctx.textAlign = "left";

                ctx.fillText(
                    checkpointMsg,
                    30,
                    canvas.height - 40
                );
            }
        }

        //////



        function checkDeath() {

            if (player.hp <= 0 && !dying) {

                dying = true;
            }
        }

        ////////
        function respawnPlayer() {

            player.x = currentCheckpoint.x;
            player.y = currentCheckpoint.y;

            player.hp = player.maxHp;

            bullets = [];

            // reset enemy
            enemies = structuredClone(originalEnemies);

            // odstráni staré sekcie
            enemies = enemies.filter(e => e.section >= currentSection);

            corpses = [];
            bloods = [];

            deathFade = 0;

            dying = false;
        }

        /////


        function updateDeathFade() {

            if (dying) {

                deathFade += 0.01;

                if (deathFade >= 1) {

                    respawnPlayer();
                }
            }
        }

        ////
        function drawDeathFade() {

            if (dying) {

                ctx.fillStyle = `rgba(0,0,0,${deathFade})`;

                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }






           function checkLevelEnd() {

            if (
                player.x + player.size / 2 > exitZone.x &&
                player.x - player.size / 2 < exitZone.x + exitZone.w &&
                player.y + player.size / 2 > exitZone.y &&
                player.y - player.size / 2 < exitZone.y + exitZone.h
            ) {

                //ďalší level
                fading = true;
            }
        }

        function updateFade() {

            if (fading) {

                fadeAlpha += 0.01;

                if (fadeAlpha >= 1) {
                    window.location.href = "Halo.html";
                }
            }
        }




        function drawFade() {

            ctx.fillStyle = `rgba(255,255,255,${fadeAlpha})`;

            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        //////////////////////////
        // KOLÍZIA
        //////////////////////////
        function collideRect(x, y, size, w) {
            return (
                x - size / 4< w.x + w.w &&
                x + size / 4 > w.x &&
                y - size / 4 < w.y + w.h &&
                y + size / 4 > w.y
            );
        }

        function collideWithWalls(x, y, size) {
            for (let w of walls) {
                if (collideRect(x, y, size, w)) return true;
            }
            return false;
        }

        //////////////////////////
        // UPDATE
        //////////////////////////
        function updatePlayer() {
            if (dying) return;
            let newX = player.x;
            let newY = player.y;
            if (keys["w"]) newY -= player.speed;
            if (keys["s"]) newY += player.speed;
            if (keys["a"]) newX -= player.speed;
            if (keys["d"]) newX += player.speed;
            if (!collideWithWalls(newX, player.y, player.size)) player.x = newX;
            if (!collideWithWalls(player.x, newY, player.size)) player.y = newY;
            player.angle = Math.atan2(mouse.y - canvas.height / 2, mouse.x - canvas.width / 2);
        }

        function updateBullets() {
            bullets.forEach((b, i) => {
                b.x += b.dx;
                b.y += b.dy;
                b.life--;

                if (b.life <= 0) {
                    bullets.splice(i, 1);
                    return;
                }
                for (let w of walls) {
                    if (collideRect(b.x, b.y, b.size, w)) {
                        bullets.splice(i, 1);
                        return;
                    }
                }
                if (b.from === "enemy") {
                    if (
                        b.x < player.x + player.size &&
                        b.x + b.size > player.x &&
                        b.y < player.y + player.size &&
                        b.y + b.size > player.y
                    ) {
                        player.hp -= 5;

                        player.lastHitTime = Date.now();
                        bullets.splice(i, 1);
                    }
                }
            });
        }

        function updateEnemies() {

            enemies.forEach(e => {

                if (!e.agro) e.agro = 0;

                if (e.agro > 0) {
                    e.agro--;
                }

                let dx = player.x - e.x;
                let dy = player.y - e.y;

                let dist = Math.sqrt(dx * dx + dy * dy);

                let speed = (e.type === "grunt") ? 1.1 : 1.3;

speed *= diff.enemySpeed;

                let activateDist = diff.enemyActivateDist;

                let stopDist = (e.type === "grunt") ? 170 : 210;

                // enemy AI variables
                if (!e.strafeDir) e.strafeDir = 1;
                if (!e.changeDirTime) e.changeDirTime = 0;
                if (!e.lastPlayerX) e.lastPlayerX = player.x;
                if (!e.lastPlayerY) e.lastPlayerY = player.y;

                // zapamätanie poslednej pozície hráča
                if (dist < activateDist) {
                    e.lastPlayerX = player.x;
                    e.lastPlayerY = player.y;
                }

                // ide ku poslednej známej pozícii
                let targetX = e.lastPlayerX;
                let targetY = e.lastPlayerY;

                dx = targetX - e.x;
                dy = targetY - e.y;

                dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < activateDist + 200 || e.agro > 0) {

                    e.angle = Math.atan2(dy, dx);

                    let moveX = 0;
                    let moveY = 0;

                    // PRIBLIŽOVANIE
                    if (dist > stopDist) {

                        moveX = dx / dist * speed;
                        moveY = dy / dist * speed;
                    }

                    // STRAFING
                    else {

                        e.changeDirTime--;

                        if (e.changeDirTime <= 0) {

                            e.strafeDir *= -1;

                            e.changeDirTime = 40 + Math.random() * 80;
                        }

                        let strafeSpeed = 0.4;

                        moveX = (-dy / dist) * strafeSpeed * e.strafeDir;
                        moveY = (dx / dist) * strafeSpeed * e.strafeDir;

                        // občas cúvne
                        if (Math.random() < 0.01) {

                        }
                    }

                    // pokus o pohyb
                    let newX = e.x + moveX;
                    let newY = e.y + moveY;

                    // normálny pohyb
                    if (!collideWithWalls(newX, newY, 30)) {

                        e.x = newX;
                        e.y = newY;
                    }

                    // ak narazí do steny
                    else {

                        // skúsi X samostatne
                        if (!collideWithWalls(newX, e.y, 30)) {

                            e.x = newX;
                        }

                        // skúsi Y samostatne
                        else if (!collideWithWalls(e.x, newY, 30)) {

                            e.y = newY;
                        }

                        // ak stále nevie ísť → skúsi obísť stenu
                        else {

                            let sideX = -dy / dist;
                            let sideY = dx / dist;

                            let try1X = e.x + sideX * speed;
                            let try1Y = e.y + sideY * speed;

                            let try2X = e.x - sideX * speed;
                            let try2Y = e.y - sideY * speed;

                            // jedna strana
                            if (!collideWithWalls(try1X, try1Y, 30)) {

                                e.x = try1X;
                                e.y = try1Y;
                            }

                            // druhá strana
                            else if (!collideWithWalls(try2X, try2Y, 30)) {

                                e.x = try2X;
                                e.y = try2Y;
                            }
                        }
                    }

                    // streľba
                    e.cooldown--;

                    if (e.cooldown <= 0 && dist < 500) {

                        let angle = Math.atan2(
                            player.y - e.y,
                            player.x - e.x
                        );

                        // nepresnosť
                        angle += (Math.random() - 0.5) * 0.18;

                        bullets.push({

                            x: e.x,
                            y: e.y,

                            dx: Math.cos(angle) * 5,
                            dy: Math.sin(angle) * 5,

                            size: 5,

                            from: "enemy",

                            enemyType: e.type,

                            life: 140
                        });



                        // elite strieľa rýchlejšie
                        e.cooldown = (
    (e.type === "grunt")
        ? 95 + Math.random() * 30
        : 45 + Math.random() * 20
) * diff.enemyFireRate;
                    }


                }
            });
        }
        function checkCollisions() {
            bullets.forEach((b, i) => {
                enemies.forEach((e, j) => {
                    if (
                        b.from === "player" &&
                        b.x < e.x + 30 &&
                        b.x + 5 > e.x &&
                        b.y < e.y + 30 &&
                        b.y + 5 > e.y
                    ) {
                        e.hp -= b.damage;

                        e.lastPlayerX = player.x;
                        e.lastPlayerY = player.y;

                        e.agro = 600;
                        bloods.push({

                            x: b.x,
                            y: b.y,

                            size: 48 + Math.random() * 10,

                            alpha: 1
                        });
                        bullets.splice(i, 1);
                        if (e.hp <= 0) {

                            corpses.push({

                                x: e.x,
                                y: e.y,

                                angle: e.angle,

                                type: e.type
                            });

                            bloods.push({

                                x: e.x,
                                y: e.y,

                                size: 60,

                                alpha: 1
                            });

                            enemies.splice(j, 1);
                        }
                    }
                });
            });
        }
        //////////////////////////
        // draw krv a mrtvoly
        //////////////////////////
        function drawBlood(offset) {

            bloods.forEach(b => {

                ctx.save();

                ctx.globalAlpha = b.alpha;

                ctx.drawImage(
                    bloodImg,
                    b.x - b.size / 2 - offset.x,
                    b.y - b.size / 2 - offset.y,
                    b.size,
                    b.size
                );

                ctx.restore();
            });
        }

        function drawCorpses(offset) {

            corpses.forEach(c => {

                let img =
                    c.type === "grunt"
                        ? gruntDeadImg
                        : eliteDeadImg;

                ctx.save();

                ctx.translate(
                    c.x - offset.x,
                    c.y - offset.y
                );

                ctx.rotate(c.angle);

                ctx.drawImage(
                    img,
                    -36,
                    -36,
                    72,
                    72
                );

                ctx.restore();
            });
        }





        //////////////////////////
        // KAMERA
        //////////////////////////
        function getOffset() {
            return {
                x: player.x - canvas.width / 2,
                y: player.y - canvas.height / 2
            };
        }



          //////////////////////////
        // LOOP
        //////////////////////////
        function gameLoop() {

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            updatePlayer();
            if (
                mouseDown &&
                weapons[player.weapon].automatic
            ) {
                shoot();
            }
            updateBullets();
            updateEnemies();
            checkCollisions();

            regenerateHp();

            checkLevelEnd();

            let offset = getOffset();

            drawBackground(offset);
            drawWalls(offset);
            drawCorpses(offset);
            drawBlood(offset);
            drawEnemies(offset);
            drawBullets(offset);
            drawPlayer();
            drawHP();
            drawAmmo();

            updateFade();
            drawFade();
            drawDeathFade();

            checkCheckpoints();

            checkDeath();
            updateDeathFade();

            drawCheckpointText();

            requestAnimationFrame(gameLoop);
        }
        gameLoop();