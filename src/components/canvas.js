import React, { useRef, useEffect, useState } from 'react'

const Canvas = ({ images }) => {
	const canvasRef = useRef(null)
	const pi2 = Math.PI * 2;
	const resizerRadius = 8;
	const rr = resizerRadius * resizerRadius;
	const [selectedImg, setSelectedImg] = useState(-1)
	const [offsetX, setOffsetX] = useState(0);
	const [offsetY, setOffsetY] = useState(0);
	const [startX, setStartX] = useState(0);
	const [startY, setStartY] = useState(0);
	const [draggingResizer, setDraggingResizer] = useState(-1);

	useEffect(() => {
		const canvas = canvasRef.current
		const context = canvas.getContext('2d')
		const offsetX = canvas.offsetLeft;
		const offsetY = canvas.offsetTop;
		setOffsetX(offsetX);
		setOffsetY(offsetY);
		draw(context, canvas);
	}, [])

	const draw = async () => {
		const canvas = canvasRef.current
		const ctx = canvas.getContext('2d')
		// clear the canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height)

		for (let i = 0; i < images.length; i++) {
			const img = images[i]
			const imgWidth = img.width
			const imgHeight = img.height
			const ratio = imgWidth / imgHeight

			if (i === 0) {
				canvas.width = parseInt(img.width)
				canvas.height = parseInt(img.height)
			} else {

				if(img.width === 0 || img.height === 0) {

					const baseImageHeight = images[0].height
	
					const newImageHeight = Math.floor(baseImageHeight * 0.2)
					const newImageWidth = Math.floor(newImageHeight * ratio)
	
					img.width = newImageWidth
					img.height = newImageHeight
				}
			}
			
			ctx.drawImage(img.img, img.x, img.y, img.width, img.height)
			if (i !== 0) {
				drawDragAnchor(img.x,img.y,ctx);
				drawDragAnchor(img.x + img.width,img.y,ctx);
				drawDragAnchor(img.x,img.y + img.height,ctx);
				drawDragAnchor(img.x+img.width,img.y + img.height,ctx);
			}

		}
	}

	function anchorHitTest(x, y, imgIndex) {
		let dx, dy
		let img = images[imgIndex]
		// top-left
		dx = x - (img.x);
		dy = y - (img.y)
		if (dx * dx + dy * dy <= rr) {
			return 0
		}
		// top-right
		dx = x - (img.x + img.width)
		dy = y - (img.y)
		if (dx * dx + dy * dy <= rr) {
			return 1
		}
		// bottom-right
		dx = x - (img.x + img.width)
		dy = y - (img.y + img.height)
		if (dx * dx + dy * dy <= rr) {
			return 2
		}
		// bottom-left
		dx = x - (img.x)
		dy = y - (img.y + img.height)
		if (dx * dx + dy * dy <= rr) {
			return 3
		}
		return -1
	}

	const drawDragAnchor = (x, y, ctx) => {
		ctx.beginPath()
		ctx.arc(x, y, resizerRadius, 0, pi2, false)
		ctx.closePath()
		ctx.fill()
	}

	// test if x,y is inside the bounding box of texts[textIndex]
	const imageHitTest = (x, y, imgIndex) => {
		let img = images[imgIndex]
		return (
			x >= img.x &&
			x <= img.x + img.width &&
			y <= img.y + img.height &&
			y >= img.y
		)
	}

	const handleMouseDown = e => {
		e.preventDefault()

		setStartX(parseInt(e.clientX - offsetX))
		setStartY(parseInt(e.clientY - offsetY))
		// Put your mousedown stuff here
		for (let i = 1; i < images.length; i++) {
			const corner = anchorHitTest(startX, startY, i)
			if (corner > -1) {
				console.log('hit anchor', corner)
				setDraggingResizer(corner)
				setSelectedImg(i)
			} else if (imageHitTest(startX, startY, i)) {
				console.log('hit image')
				setSelectedImg(i)
			}
		}
	}

	const handleMouseMove = (e) => {
		let mouseX = parseInt(e.clientX - offsetX)
		let mouseY = parseInt(e.clientY - offsetY)

		console.log(`mouse x ${mouseX}`)
		console.log(`mouse y ${mouseY}`)
		let img = images[selectedImg]
		setStartX(mouseX)
		setStartY(mouseY)
		
		if (selectedImg < 1) {
			return
		}
		e.preventDefault()
		
		// Put your mousemove stuff here
		let dx = mouseX - startX
		let dy = mouseY - startY

		if (draggingResizer > -1) {
			// resize the image
			const imageRight = img.x + img.width
			const imageBottom = img.y + img.height
			switch (draggingResizer) {
				case 0:
					//top-left
					img.x = mouseX;
					img.width = imageRight - mouseX;
					img.y = mouseY;
					img.height = imageBottom - mouseY;
					break;
				case 1:
					//top-right
					img.y = mouseY;
					img.width = mouseX - img.x;
					img.height = imageBottom - mouseY;
					break;
				case 2:
					//bottom-right
					img.width = mouseX - img.x;
					img.height = mouseY - img.y;
					break;
				case 3:
					//bottom-left
					img.x = mouseX;
					img.width = img.x - mouseX;
					img.height = mouseY - img.y;
					break;
			}

			if(img.width<25){img.width=25;}
			if(img.height<25){img.height=25;}

			// redraw the image with resizing anchors
			draw();
		} else {
			console.log("banana")
			img.x += dx
			img.y += dy
			draw()
		}
	}

	const handleMouseUp = (e) => {
    	e.preventDefault()
		setSelectedImg(-1)
		setDraggingResizer(-1)
	}

	const handleMouseOut = (e) => {
		e.preventDefault()
		setSelectedImg(-1)
	}

	if (images.length !== 0) {
		draw()
	}
	return (
		<canvas
			onMouseDown={handleMouseDown}
			onMouseMove={handleMouseMove}
			onMouseUp={handleMouseUp}
			onMouseOut={handleMouseOut}
			ref={canvasRef}
			id="canvas"
		/>
	)
}

export default Canvas
