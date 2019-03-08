function draw() {
    // line(x1,y1, x2,y2)
    // draws a line from a point at Normalized screen coordinates x1,y1 to Normalized screen coordinates x2,y2

    //base
    line(-0.5, -0.7, 0.5, -0.7);

    line(-0.5, -0.7, -0.5, 0.5);
    line(0.5, -0.7, 0.5, 0.5);

    //top
    line(-0.5, 0.5, 0, 0.8);
    line(0.5, 0.5, 0, 0.8);

    //chimneny
    line(0.5, 0.5, 0.5, 0.8);
    line(0.4, 0.56, 0.4, 0.8);
    line(0.5, 0.8, 0.4, 0.8);

    //door
    line(-0.1, -0.7, -0.1, -0.3);
    line(0.1, -0.7, 0.1, -0.3);
    line(-0.1, -0.3, 0.1, -0.3);

    //windows (left mirrored along y axis)
    line(-0.4, 0, -0.4, 0.2);
    line(-0.2, 0, -0.2, 0.2);
    line(-0.4, 0.2, -0.2, 0.2);
    line(-0.4, 0, -0.2, 0);

    line(0.4, 0, 0.4, 0.2);
    line(0.2, 0, 0.2, 0.2);
    line(0.4, 0.2, 0.2, 0.2);
    line(0.4, 0, 0.2, 0);
    
}