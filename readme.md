# Bubbles
Bubbles is a HTML5 viewer for panoramatic images and virtual tours. The viewer is based on Three.js library. 

## Usage

Download the skeleton folder and use the `pano.editor.html` app.

### index.html
```javascript
<script>
    new Bubbles({ 
        target: "container",
        file: "pano.json",
    });
</script>
```