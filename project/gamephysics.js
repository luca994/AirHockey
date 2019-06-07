'use strict';

(function(){

var b2Vec2 = Box2D.Common.Math.b2Vec2;
var FixtureTypes = {
    EDGE: 0,
    PUCK: 1,
    PADDLE: 2,
    GOAL: 3
}

window.GamePhysics = window.GamePhysics || {};

GamePhysics = function(gameData) {
    this.gameData = gameData;
    this.pucks = [];
    this.paddles = [];

    Box2D.Common.b2Settings.b2_velocityThreshold = 0.1;
    var world = new Box2D.Dynamics.b2World(new b2Vec2(0,0),false);
    this.world = world;
    world.SetContinuousPhysics(true);
    world.SetContactListener(this);

    var groundDef = new Box2D.Dynamics.b2BodyDef();
    groundDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
    groundDef.position.Set(0,0);

    var ground = world.CreateBody( groundDef );
    this.ground = ground;

    function addEdge(v1x,v1y,v2x,v2y){
        var fixtureDef = new Box2D.Dynamics.b2FixtureDef;
        fixtureDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
        fixtureDef.shape.SetAsEdge(new b2Vec2(v1x,v1y), new b2Vec2(v2x,v2y));
        fixtureDef.friction = 0.1;
        fixtureDef.restitution = 0.8;
        fixtureDef.density = 0.8;
        fixtureDef.userData = {type: FixtureTypes.EDGE};

        ground.CreateFixture(fixtureDef) ;

    }

    function addCornerEdge(x, y, angle, radius){

        var steps = 5;
        for (var i = 1; i <= steps; ++i) {
            var a1 = angle - Math.PI * 0.5 * (i-1)/steps;
            var a2 = angle - Math.PI * 0.5 * (i)/steps;
            addEdge(x + radius * Math.cos(a1), y + radius * Math.sin(a1), x + radius * Math.cos(a2), y + radius * Math.sin(a2));
        }
    }

    function addGoalPost(x,y,w,h){

        var bodyDef = new Box2D.Dynamics.b2BodyDef();
        bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
        bodyDef.position.Set(x + w * 0.5, y + h * 0.5);

        var fixtureDef = new Box2D.Dynamics.b2FixtureDef;
        fixtureDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
        fixtureDef.shape.SetAsBox(w/2,h/2);
        fixtureDef.friction = 0.1;
        fixtureDef.restitution = 0.8;
        fixtureDef.density = 0.8;
        fixtureDef.userData = {type: FixtureTypes.EDGE};

        var body = world.CreateBody(bodyDef);
        body.CreateFixture(fixtureDef)
    }

    function addGoalSensor(x,y,w,h, playerIndex){
        var bodyDef = new Box2D.Dynamics.b2BodyDef();
        bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
        bodyDef.position.Set(x + w * 0.5, y + h * 0.5);

        var fixtureDef = new Box2D.Dynamics.b2FixtureDef;
        fixtureDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
        fixtureDef.shape.SetAsBox(w/2,h/2);
        fixtureDef.userData = {type: FixtureTypes.GOAL, index:playerIndex };

        var body = world.CreateBody(bodyDef);
        var fixture = body.CreateFixture(fixtureDef)
        fixture.SetSensor(true);
    }

    var table = gameData.tableSize;
    //add table edges
    var w = table.width * 0.5;
    var d = table.depth * 0.5;
    var cr = table.width * 0.1; //corner radius
    addEdge(w - cr,-d,-w + cr,-d); //BR BL
    addCornerEdge(-w + cr, -d + cr, 3 * Math.PI/2, cr);
    addEdge(-w,-d + cr,-w, d - cr); //BL TL
    addCornerEdge(-w + cr, d - cr, Math.PI, cr);
    addEdge(-w + cr,d, w - cr,d);//TL TR
    addCornerEdge(w - cr, d - cr, Math.PI * 0.5, cr);
    addEdge(w, d - cr, w, -d + cr); //TR BR
    addCornerEdge(w - cr, -d + cr, 0, cr);

    //add goals
    var gw = gameData.goalSize.width * table.width; //goal width
    var gh = gameData.goalSize.depth * table.depth; //goal height
    var postWidth = gw * 0.05;
    var postDepth = gh;
    addGoalPost(-gw * 0.5, -table.depth/2, postWidth, postDepth );
    addGoalPost(gw * 0.5 - postWidth, -table.depth/2, postWidth, postDepth );
    addGoalPost(-gw * 0.5, table.depth/2 - postDepth, postWidth, postDepth );
    addGoalPost(gw * 0.5 - postWidth, table.depth/2 - postDepth, postWidth, postDepth );

    gw-= gameData.puck.radius;
    gh-= gameData.puck.radius;
    addGoalSensor(-gw * 0.5, -table.depth/2, gw, gh, 0);
    addGoalSensor(-gw * 0.5, table.depth/2 - gh, gw, gh, 1);


    //add puck
    this.addPuck(gameData.puck);

    //add paddles
    this.addPaddle(gameData.playerA.position, gameData.playerA.radius);
    this.addPaddle(gameData.playerB.position, gameData.playerB.radius);

}

GamePhysics.prototype = {

    addPuck: function(puck) {
        var bodyDef = new Box2D.Dynamics.b2BodyDef() ;
        var radius = puck.radius;
        bodyDef.position.Set(puck.position.x, puck.position.z);
        bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;

        var body = this.world.CreateBody( bodyDef ) ;

        var fixtureDef   = new Box2D.Dynamics.b2FixtureDef() ;
        fixtureDef.shape = new Box2D.Collision.Shapes.b2CircleShape(radius);

        fixtureDef.friction    = 0.2;
        fixtureDef.restitution = 0.8;
        fixtureDef.density     = 0.6;
        fixtureDef.userData = {type: FixtureTypes.PUCK, position:puck.position};

        body.CreateFixture(fixtureDef) ;

        this.pucks.push({body:body, position:puck.position});

    },

    addPaddle: function(position, radius) {
        var bodyDef = new Box2D.Dynamics.b2BodyDef() ;
        bodyDef.position.Set(position.x, position.z);
        bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;

        var body = this.world.CreateBody( bodyDef ) ;

        var fixtureDef   = new Box2D.Dynamics.b2FixtureDef() ;
        fixtureDef.shape = new Box2D.Collision.Shapes.b2CircleShape(radius);
        fixtureDef.friction    = 0.5;
        fixtureDef.restitution = 0.5;
        fixtureDef.density     = 0.9;
        fixtureDef.userData = {type: FixtureTypes.PADDLE};
        body.CreateFixture(fixtureDef) ;

        var def = new Box2D.Dynamics.Joints.b2MouseJointDef();

        def.bodyA = this.ground;
        def.bodyB = body;
        def.target = body.GetPosition();

        def.collideConnected = true;
        def.maxForce = 10000 * body.GetMass();
        def.dampingRatio = 0;

        var mouseJoint = this.world.CreateJoint(def);

        body.SetAwake(true);

        this.paddles.push({joint:mouseJoint, position:position, body:body});
    },

    updatePaddles: function() {
        for (var i = 0; i < this.paddles.length; ++i) {
            var joint = this.paddles[i].joint;
            var position = this.paddles[i].position;
            joint.SetTarget(new b2Vec2(position.x, position.z));
        }
    },

    rstPucks: function() {
        for (var i = 0; i < this.pucks.length; ++i) {
            var body = this.pucks[i].body;
            var puck = this.pucks[i].position;
            body.SetPositionAndAngle(new b2Vec2(puck.x, puck.z), 0);
            body.SetLinearVelocity(new b2Vec2(0,0));
            body.SetActive(true);
        }
    },

    getPucksAwayFromEdges: function() {
        for (var i = 0; i< this.pucks.length; ++i) {
            var body = this.pucks[i].body;
            if (body.IsActive()) {
                var posX = body.GetPosition().y;
                var posY = body.GetPosition().y;
                var force = 0.01;
                var fx = 0;
                var fy = 0;
                //behind goal
                if (posY > this.gameData.tableSize.depth * (0.5 - this.gameData.goalSize.depth)) {
                    fy = -force;
                }
                else if (posY < -this.gameData.tableSize.depth * (0.5 - this.gameData.goalSize.depth)) {
                    fy = force;
                }

                //left and right edges
                if (posX < -this.gameData.tableSize.depth/2 * 0.9) {
                    fx = force;
                }
                if (posX > this.gameData.tableSize.depth/2 * 0.9) {
                    fx = -force;
                }

                if (fx || fy) {
                    body.ApplyForce(new b2Vec2(fx, fy),body.GetWorldCenter());
                }

            }
        }

    },
    simulate: function(dt) {
        this.getPucksAwayFromEdges();
        this.world.Step(dt || 1/60, 5, 5);
        this.world.ClearForces();

        for (var i = 0; i< this.pucks.length; ++i) {
            var obj = this.pucks[i];
            var pos = obj.body.GetWorldCenter();
            obj.position.x = pos.x;
            obj.position.z = pos.y;
        }
    },

    BeginContact: function(contact) {
        var c1 = contact.m_fixtureA.GetUserData();
        var c2 = contact.m_fixtureB.GetUserData();

        var me = this;
        if (c1.type === FixtureTypes.GOAL && c2.type === FixtureTypes.PUCK) {
            setTimeout(function(){
                contact.m_fixtureB.GetBody().SetActive(false);
                console.log(me.pucks[0].position);
                this.gameData.goal(c1.index);
                console.log(me.pucks[0].position);
            },10);
            return;
        }
        else if (c2.type === FixtureTypes.GOAL && c1.type === FixtureTypes.PUCK) {
            setTimeout(function(){
                contact.m_fixtureA.GetBody().SetActive(false);
                this.gameData.goal(c1.index);
            },10);
            return;
        }
    },

    EndContact: function(contact) {

    },

    PreSolve: function(){
    },

    PostSolve: function(){

    }

}

})();
