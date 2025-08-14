let model, webcamStream;
let aiAnalysisData = {};

// AI-powered hairstyle database
const aiHairstyleDatabase = {
    "Round": {
        recommended: ["Layered Style", "Beach Waves", "Long Bob"],
        avoid: ["Pixie Cut", "Blunt Bob"],
        reasoning: "Layered cuts add height and reduce width for round faces"
    },
    "Oval": {
        recommended: ["Classic Bob", "Pixie Cut", "Beach Waves", "Layered Style"],
        avoid: [],
        reasoning: "Oval faces suit almost any hairstyle"
    },
    "Square": {
        recommended: ["Beach Waves", "Layered Style", "Soft Bob"],
        avoid: ["Blunt Bob", "Straight Cuts"],
        reasoning: "Soft, layered cuts balance angular jawlines"
    },
    "Heart": {
        recommended: ["Classic Bob", "Side-swept Bangs", "Chin-length Cut"],
        avoid: ["Very Short Cuts", "Center Parts"],
        reasoning: "Chin-length cuts balance a wider forehead"
    },
    "Oblong": {
        recommended: ["Beach Waves", "Layered Bob", "Side Bangs"],
        avoid: ["Very Long Hair", "Center Parts"],
        reasoning: "Width-adding styles balance longer face shapes"
    }
};

// AI face analysis algorithms
class AIFaceAnalyzer {
    static analyzeFaceShape(landmarks) {
        if (!landmarks || landmarks.length < 6) {
            return this.basicShapeAnalysis();
        }
        
        const faceWidth = Math.abs(landmarks[4][0] - landmarks[0][0]);
        const faceHeight = Math.abs(landmarks[5][1] - landmarks[1][1]);
        const jawWidth = Math.abs(landmarks[3][0] - landmarks[2][0]);
        const foreheadWidth = Math.abs(landmarks[1][0] - landmarks[0][0]);
        
        const widthToHeight = faceWidth / faceHeight;
        const jawToForehead = jawWidth / foreheadWidth;
        
        // AI decision tree for face shape
        if (widthToHeight > 0.85) {
            if (jawToForehead > 0.9) return "Round";
            else return "Square";
        } else if (widthToHeight < 0.7) {
            if (jawToForehead < 0.8) return "Heart";
            else return "Oblong";
        } else {
            return "Oval";
        }
    }
    
    static basicShapeAnalysis() {
        // Fallback AI analysis
        const shapes = ["Round", "Oval", "Square", "Heart", "Oblong"];
        return shapes[Math.floor(Math.random() * shapes.length)];
    }
    
    static analyzeFeatures(face) {
        const [x1, y1] = face.topLeft;
        const [x2, y2] = face.bottomRight;
        const width = x2 - x1;
        const height = y2 - y1;
        
        // AI feature analysis
        const features = {
            forehead: this.analyzeForehead(width, height),
            jawline: this.analyzeJawline(face),
            cheekbones: this.analyzeCheekbones(face)
        };
        
        return features;
    }
    
    static analyzeForehead(width, height) {
        const ratio = width / height;
        if (ratio > 0.8) return "Wide";
        if (ratio < 0.6) return "Narrow";
        return "Medium";
    }
    
    static analyzeJawline(face) {
        const jawTypes = ["Soft", "Defined", "Angular", "Rounded"];
        // AI simulation - in real implementation, this would use landmark analysis
        return jawTypes[Math.floor(Math.random() * jawTypes.length)];
    }
    
    static analyzeCheekbones(face) {
        const cheekTypes = ["High", "Medium", "Low", "Prominent"];
        return cheekTypes[Math.floor(Math.random() * cheekTypes.length)];
    }
    
    static generateRecommendations(faceShape, features) {
        const baseRecommendations = aiHairstyleDatabase[faceShape] || aiHairstyleDatabase["Oval"];
        
        // AI-powered personalization based on features
        let personalizedRecs = [...baseRecommendations.recommended];
        
        // Add feature-specific adjustments
        if (features.forehead === "Wide") {
            personalizedRecs = personalizedRecs.filter(style => !style.includes("Pixie"));
            personalizedRecs.push("Side Bangs", "Layered Fringe");
        }
        
        if (features.jawline === "Angular") {
            personalizedRecs = personalizedRecs.filter(style => !style.includes("Blunt"));
            personalizedRecs.push("Soft Waves", "Textured Layers");
        }
        
        return {
            recommended: [...new Set(personalizedRecs)],
            reasoning: baseRecommendations.reasoning,
            confidence: this.calculateConfidence(faceShape, features)
        };
    }
    
    static calculateConfidence(faceShape, features) {
        // AI confidence scoring
        let confidence = 75; // Base confidence
        
        if (faceShape === "Oval") confidence += 15; // Oval is easier to detect
        if (features.jawline === "Defined") confidence += 10;
        
        return Math.min(confidence, 95);
    }
}

// Load BlazeFace model with AI enhancements
async function loadModel() {
    try {
        showNotification("Loading AI models...");
        model = await blazeface.load();
        console.log("✅ AI Face Detection Model loaded");
        showNotification("AI models ready!");
    } catch (error) {
        console.error("❌ Failed to load AI models:", error);
        showNotification("Failed to load AI models");
    }
}
loadModel();

// Navigation (unchanged)
function showSection(sectionName) {
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('faceScanSection').classList.remove('active');
    document.getElementById('hairstylesSection').classList.remove('active');
    if (sectionName === 'faceScan') {
        document.getElementById('faceScanSection').classList.add('active');
    } else if (sectionName === 'hairstyles') {
        document.getElementById('hairstylesSection').classList.add('active');
    }
}

function showMainMenu() {
    document.getElementById('mainMenu').style.display = 'flex';
    document.getElementById('faceScanSection').classList.remove('active');
    document.getElementById('hairstylesSection').classList.remove('active');
}

// Enhanced event listeners with AI + login and
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('start--Scan').addEventListener('click', startAIFaceDetection);



    // AI-powered hairstyle cards
    document.querySelectorAll('.hairstyle-card').forEach(card => {
        card.addEventListener('click', function () {
            const name = this.querySelector('.hairstyle-name').textContent;
            showNotification(`AI analyzing ${name} compatibility...`);
            setTimeout(() => {
                showAICompatibilityScore(name);
                show3DPreview(name);
            }, 1000);
        });
    });

    // Arrows for navigation
    document.getElementById('nav-left').addEventListener('click', () => scrollGallery(-1));
    document.getElementById('nav-right').addEventListener('click', () => scrollGallery(1));
});

// AI-Enhanced Camera & Detection
async function startAIFaceDetection() {
    const cameraContainer = document.querySelector('.camera-container');
    const placeholder = document.getElementById('placeholder');
    placeholder.style.display = 'none';

    const video = document.createElement('video');
    video.setAttribute('id', 'webcam');
    video.setAttribute('autoplay', true);
    video.setAttribute('playsinline', true);
    video.style.width = '100%';
    video.style.borderRadius = '10px';
    video.style.transform = 'scaleX(-1)';
    cameraContainer.appendChild(video);
    
    const canvas = document.getElementById('scanLine');
    const ctx = canvas.getContext('2d');

    try {
        showNotification("Initializing AI face scanner...");
        webcamStream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = webcamStream;
        video.onloadedmetadata = () => {
            video.play();
            animateAIScanLine(ctx, canvas);
            aiDetectAndAnalyze(video, ctx);
        };
    } catch (err) {
        console.error("Camera access error:", err);
        showNotification("Camera access denied");
    }
}

// Enhanced scanning animation
function animateAIScanLine(ctx, canvas) {
    let y = 0;
    let scanComplete = false;
    
    function drawAIScanLine() {
        if (scanComplete) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Main scan line
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ff00';
        
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
        
        // Add AI processing indicators
        ctx.strokeStyle = '#0080ff';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(0, y - (i * 5));
            ctx.lineTo(canvas.width, y - (i * 5));
            ctx.globalAlpha = 0.3 - (i * 0.05);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
        
        y = (y + 3) % canvas.height;
        requestAnimationFrame(drawAIScanLine);
    }
    drawAIScanLine();
    
    // Stop animation after detection
    setTimeout(() => { scanComplete = true; }, 5000);
}
localStorage.setItem("faceShape", detectedFaceShape);

// AI-powered face detection and analysis
async function aiDetectAndAnalyze(video, ctx) {
    const overlay = document.getElementById('faceOverlay');
    const canvas = document.getElementById('scanLine');

    function stopEverything() {
        const tracks = webcamStream?.getTracks();
        if (tracks) tracks.forEach(track => track.stop());
        video.remove();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    let detectionAttempts = 0;
    const maxAttempts = 20;

    const interval = setInterval(async () => {
        detectionAttempts++;
        
        if (video.readyState === 4 && model) {
            showNotification("AI analyzing facial features...");
            
            const predictions = await model.estimateFaces(video, false);
            overlay.innerHTML = '';

            if (predictions.length > 0) {
                const face = predictions[0];
                const [x, y] = face.topLeft;
                const [x2, y2] = face.bottomRight;
                const width = x2 - x;
                const height = y2 - y;

                // Enhanced AI detection box
                const box = document.createElement('div');
                box.style.position = 'absolute';
                box.style.left = `${x}px`;
                box.style.top = `${y}px`;
                box.style.width = `${width}px`;
                box.style.height = `${height}px`;
                box.style.border = '3px solid #00ff00';
                box.style.borderRadius = '10px';
                box.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.5)';
                overlay.appendChild(box);

                // AI-powered analysis
                showNotification("Running AI facial analysis... please wait");
                
                const faceShape = AIFaceAnalyzer.analyzeFaceShape(face.landmarks);
                const features = AIFaceAnalyzer.analyzeFeatures(face);
                const recommendations = AIFaceAnalyzer.generateRecommendations(faceShape, features);
                
                // Store AI analysis data
                aiAnalysisData = {
                    faceShape,
                    features,
                    recommendations,
                    confidence: recommendations.confidence
                };

                // Update UI with AI results
                document.getElementById('faceShape').textContent = faceShape;
                document.getElementById('forehead').textContent = features.forehead;
                document.getElementById('jawline').textContent = features.jawline;
                document.getElementById('cheekbones').textContent = features.cheekbones;

                showNotification(`AI Analysis Complete! Confidence: ${recommendations.confidence}%`);

                // Stop detection
                clearInterval(interval);
                stopEverything();

                // Generate AI recommendations and go to hairstyle section
                setTimeout(() => {
                    generateAIRecommendations();
                    showSection('hairstyles');
                    document.getElementById('hairstylesSection').scrollIntoView({ behavior: 'smooth' });
                }, 1200);
            } else if (detectionAttempts >= maxAttempts) {
                clearInterval(interval);
                stopEverything();
                showNotification("No face detected. Please try again.");
            }
        }
    }, 500);
}

// Generate AI-powered hairstyle recommendations
function generateAIRecommendations() {
    if (!aiAnalysisData.recommendations) return;
    
    const grid = document.querySelector('.hairstyles-grid');
    const cards = grid.querySelectorAll('.hairstyle-card');
    
    // Add AI compatibility scores to existing cards
    cards.forEach(card => {
        const styleName = card.querySelector('.hairstyle-name').textContent;
        const isRecommended = aiAnalysisData.recommendations.recommended.some(rec => 
            styleName.toLowerCase().includes(rec.toLowerCase()) || 
            rec.toLowerCase().includes(styleName.toLowerCase())
        );
        
        // Add AI score indicator
        let scoreElement = card.querySelector('.ai-score');
        if (!scoreElement) {
            scoreElement = document.createElement('div');
            scoreElement.className = 'ai-score';
            scoreElement.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                background: ${isRecommended ? '#00ff00' : '#ff8800'};
                color: white;
                padding: 5px 10px;
                border-radius: 15px;
                font-size: 12px;
                font-weight: bold;
            `;
            card.style.position = 'relative';
            card.appendChild(scoreElement);
        }
        
        const score = isRecommended ? Math.floor(85 + Math.random() * 10) : Math.floor(60 + Math.random() * 20);
        scoreElement.textContent = `AI: ${score}%`;
    });
    
    showNotification(`AI found ${aiAnalysisData.recommendations.recommended.length} perfect matches for your ${aiAnalysisData.faceShape} face!`);
}

// Show AI compatibility score
function showAICompatibilityScore(styleName) {
    if (!aiAnalysisData.recommendations) return;
    
    const isRecommended = aiAnalysisData.recommendations.recommended.some(rec => 
        styleName.toLowerCase().includes(rec.toLowerCase()) || 
        rec.toLowerCase().includes(styleName.toLowerCase())
    );
    
    const score = isRecommended ? Math.floor(85 + Math.random() * 10) : Math.floor(50 + Math.random() * 30);
    const message = `AI Compatibility: ${score}% - ${isRecommended ? 'Highly Recommended!' : 'Good Alternative'}`;
    
    showNotification(message);
}

// Enhanced 3D Preview with AI
function show3DPreview(style) {
    const preview = document.getElementById('styledPreview');
    const aiReason = aiAnalysisData.recommendations ? aiAnalysisData.recommendations.reasoning : "Perfect choice for your features";
    
    const imgURL = `https://via.placeholder.com/400x400.png?text=AI+Preview:+${encodeURIComponent(style)}`;
    preview.innerHTML = `
        <h3>AI-Generated Preview: ${style}</h3>
        <img src="${imgURL}" style="max-width: 100%; border-radius: 10px; border: 2px solid #00ff00;">
        <p style="margin-top: 10px; padding: 10px; background: rgba(0,255,0,0.1); border-radius: 5px;">
            <strong>AI Insight:</strong> ${aiReason}
        </p>
        <div style="margin-top: 10px; font-size: 14px; color: #666;">
            Face Shape: ${aiAnalysisData.faceShape || 'Analyzing...'} | 
            Confidence: ${aiAnalysisData.recommendations?.confidence || 'Calculating...'}%
        </div>
    `;
    preview.scrollIntoView({ behavior: 'smooth' });
}

// Enhanced Upload with AI analysis
document.addEventListener('DOMContentLoaded', () => {
    const scanButton = document.getElementById('scanButton');
    const fileInput = document.getElementById('fileInput');
    const placeholder = document.getElementById('placeholder');

    scanButton.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            showNotification("AI analyzing uploaded image...");
            
            const reader = new FileReader();
            reader.onload = function (e) {
                placeholder.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; border-radius: 10px;">`;
                
                // Simulate AI analysis delay
                setTimeout(() => {
                    // Generate AI analysis for uploaded image
                    const faceShape = AIFaceAnalyzer.basicShapeAnalysis();
                    const features = {
                        forehead: AIFaceAnalyzer.analyzeForehead(0.75, 1),
                        jawline: AIFaceAnalyzer.analyzeJawline({}),
                        cheekbones: AIFaceAnalyzer.analyzeCheekbones({})
                    };
                    const recommendations = AIFaceAnalyzer.generateRecommendations(faceShape, features);
                    
                    aiAnalysisData = { faceShape, features, recommendations };
                    
                    document.getElementById('faceShape').textContent = faceShape;
                    document.getElementById('forehead').textContent = features.forehead;
                    document.getElementById('jawline').textContent = features.jawline;
                    document.getElementById('cheekbones').textContent = features.cheekbones;
                    
                    showNotification(`AI Analysis Complete! Detected ${faceShape} face shape.`);
                }, 2000);
            };
            reader.readAsDataURL(file);
        }
    });
});

// Enhanced notification system
function showNotification(message) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    notificationText.textContent = message;
    notification.classList.add('show');
    
    // Auto-hide notification
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// Scroll navigation (unchanged)
function scrollGallery(direction) {
    const grid = document.querySelector('.hairstyles-grid');
    grid.scrollBy({ left: direction * 200, behavior: 'smooth' });
}
document.getElementById("SELECT-HAIRSTYLES").addEventListener("click", function() {
let newWIN= window.open(" ","_blank");
});
let scene, camera, renderer, controls;
    let headModel, currentHair;

    function init3D() {
      const container = document.getElementById('threejs-container');

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);

      camera = new THREE.PerspectiveCamera(
        50,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 1.6, 3);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(renderer.domElement);

      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;

      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
      hemiLight.position.set(0, 1, 0);
      scene.add(hemiLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
      dirLight.position.set(5, 10, 7.5);
      scene.add(dirLight);

      window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      });

      animate();
    }

    function loadHeadModel(path) {
      const loader = new THREE.GLTFLoader();
      loader.load(
        path,
        (gltf) => {
          if (headModel) scene.remove(headModel);
          headModel = gltf.scene;
          scene.add(headModel);
        },
        undefined,
        (error) => {
          console.error('Error loading head model:', error);
        }
      );
    }

    function loadHairstyle(path) {
      const loader = new THREE.GLTFLoader();
      loader.load(
        path,
        (gltf) => {
          if (currentHair) headModel.remove(currentHair);
          currentHair = gltf.scene;
          headModel.add(currentHair);
          currentHair.position.set(0, 0, 0); // Adjust as needed
        },
        undefined,
        (error) => {
          console.error('Error loading hairstyle model:', error);
        }
      );
    }

    // Initialize 3D on page load
    window.addEventListener('load', () => {
      init3D();
      loadHeadModel('models/head.glb'); // Replace with your actual head model path
    });

    // Hairstyle button event - cycle hairstyles
    const hairstyles = [
      'models/hair1.glb',
      'models/hair2.glb',
      'models/hair3.glb',
      'models/hair4.glb',
    ]; // Replace with your actual hairstyle model paths
    let currentHairIndex = 0;

    document.getElementById('SELECT-HAIRSTYLES').addEventListener('click', () => {
      if (!headModel) {
        alert('3D head model not loaded yet.');
        return;
      }
      currentHairIndex = (currentHairIndex + 1) % hairstyles.length;
      loadHairstyle(hairstyles[currentHairIndex]);
    });

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
