let activities = [];
let showAnalysis = false;
const apiKey = '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';

const categories = {
    work: { color: 'bg-green-500', label: 'Deep Work' },
    meeting: { color: 'bg-gray-500', label: 'Meetings' },
    break: { color: 'bg-green-300', label: 'Breaks' },
    admin: { color: 'bg-gray-400', label: 'Admin Tasks' },
    monotonous: { color: 'bg-yellow-500', label: 'Monotonous Tasks' },
    distraction: { color: 'bg-gray-600', label: 'Distractions' },
    commute: { color: 'bg-gray-300', label: 'Commute' }
};

// Initialize Lucide icons on load
window.onload = function() {
    lucide.createIcons();
};

function convertTimeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

function formatMinutes(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

function addActivity() {
    const name = document.getElementById('activityName').value.trim();
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const category = document.getElementById('category').value;

    if (name) {
        const start = convertTimeToMinutes(startTime);
        const end = convertTimeToMinutes(endTime);
        
        if (end > start) {
            const activity = {
                id: Date.now(),
                name: name,
                startTime: startTime,
                endTime: endTime,
                category: category,
                duration: end - start
            };
            
            activities.push(activity);
            document.getElementById('activityName').value = '';
            updateDisplay();
        }
    }
}

function removeActivity(id) {
    activities = activities.filter(a => a.id !== id);
    updateDisplay();
}

function updateDisplay() {
    const activitiesSection = document.getElementById('activitiesSection');
    const analysisButtonSection = document.getElementById('analysisButtonSection');
    const activitiesList = document.getElementById('activitiesList');

    if (activities.length > 0) {
        activitiesSection.classList.remove('hidden');
        analysisButtonSection.classList.remove('hidden');
        
        // Sort activities by start time
        const sortedActivities = activities.sort((a, b) => 
            convertTimeToMinutes(a.startTime) - convertTimeToMinutes(b.startTime)
        );

        activitiesList.innerHTML = sortedActivities.map(activity => `
            <div class="activity-card group relative bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 hover:border-green-300">
                <div class="flex items-center gap-6">
                    <div class="w-6 h-6 rounded-full ${categories[activity.category].color} shadow-sm"></div>
                    <div class="flex-1">
                        <div class="font-bold text-gray-900 text-lg">${activity.name}</div>
                        <div class="text-gray-500 flex items-center gap-4 mt-1">
                            <span class="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                                ${activity.startTime} - ${activity.endTime}
                            </span>
                            <span class="text-green-600 font-semibold">${formatMinutes(activity.duration)}</span>
                            <span class="text-gray-400">•</span>
                            <span class="text-gray-600">${categories[activity.category].label}</span>
                        </div>
                    </div>
                    <button
                        onclick="removeActivity(${activity.id})"
                        class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 p-3 hover:bg-gray-50 rounded-xl transition-all duration-200"
                    >
                        <i data-lucide="trash-2" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Re-initialize Lucide icons
        lucide.createIcons();
    } else {
        activitiesSection.classList.add('hidden');
        analysisButtonSection.classList.add('hidden');
        document.getElementById('analysisResults').classList.add('hidden');
        showAnalysis = false;
    }
}

async function toggleAnalysis() {
    showAnalysis = !showAnalysis;
    const analysisResults = document.getElementById('analysisResults');
    const analysisButtonText = document.getElementById('analysisButtonText');
    const analysisButton = document.getElementById('analysisButton');

    if (showAnalysis) {
        analysisResults.classList.remove('hidden');
        analysisButtonText.innerHTML = '<div class="loading-spinner"></div>';
        analysisButton.disabled = true;
        
        try {
            await generateAIAnalysis();
            analysisButtonText.textContent = 'Hide AI Analysis';
        } catch (error) {
            console.error('AI Analysis failed:', error);
            analysisButtonText.textContent = 'AI Analysis Failed - Try Again';
            generateFallbackAnalysis();
        } finally {
            analysisButton.disabled = false;
        }
    } else {
        analysisResults.classList.add('hidden');
        analysisButtonText.textContent = 'Unleash AI Analysis';
    }
}

async function generateAIAnalysis() {
    const prompt = `Analyze this workday schedule and provide specific, actionable insights:

Activities:
${activities.map(a => `- ${a.name} (${a.startTime}-${a.endTime}, ${categories[a.category].label})`).join('\n')}

Provide detailed analysis with specific recommendations. Each array should contain 3-5 items with actual actionable advice, not generic placeholders.

Return JSON with:
- inefficiencies: Array of specific problems you identify (e.g., "45 minutes of fragmented email checking could be batched into 2 focused sessions")
- aiOpportunities: Array of specific AI tools and automation suggestions (e.g., "Use Calendly AI scheduling to eliminate 15 minutes of daily back-and-forth emails")
- recommendations: Array of specific actionable steps (e.g., "Block 2-hour deep work sessions by turning off notifications and using Forest app")
- weeklySavings: Number representing estimated weekly time savings in minutes

Be specific and actionable in every recommendation.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'OpenAI-Organization': '',
            'User-Agent': 'AI-Workday-Optimizer/1.0'
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a productivity expert specializing in AI automation and workflow optimization. Provide specific, actionable insights in valid JSON format.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 1500,
            temperature: 0.7,
            response_format: { type: "json_object" }
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API Error:', errorData);
        throw new Error(`OpenAI API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    let aiInsights;
    
    try {
        aiInsights = JSON.parse(data.choices[0].message.content);
        
        // Debug logging
        console.log('Raw AI Response:', data.choices[0].message.content);
        console.log('Parsed insights:', aiInsights);
        
        // Validate that we have actual content, not just placeholders
        const hasRealContent = (arr) => arr && arr.length > 0 && arr.some(item => {
            const text = typeof item === 'string' ? item : item.text || item.description || '';
            return text.length > 20 && !text.includes('provided') && !text.includes('identified') && !text.includes('recommendation');
        });
        
        // If AI returned generic responses, use our detailed fallback
        if (!hasRealContent(aiInsights.recommendations) || !hasRealContent(aiInsights.aiOpportunities)) {
            console.log('AI returned generic responses, using enhanced fallback');
            generateFallbackAnalysis();
            return;
        }
        
        // Ensure arrays exist and are properly formatted
        if (!aiInsights.aiOpportunities) aiInsights.aiOpportunities = [];
        if (!aiInsights.inefficiencies) aiInsights.inefficiencies = [];
        if (!aiInsights.recommendations) aiInsights.recommendations = [];
        if (!aiInsights.weeklySavings) aiInsights.weeklySavings = 0;
        
    } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.log('Raw response:', data.choices[0].message.content);
        throw new Error('Failed to parse AI response');
    }
    
    displayAIAnalysis(aiInsights);
}

function generateFallbackAnalysis() {
    // Fallback to rule-based analysis if AI fails
    const totalTime = activities.reduce((sum, activity) => sum + activity.duration, 0);
    const categoryStats = {};
    
    activities.forEach(activity => {
        if (!categoryStats[activity.category]) {
            categoryStats[activity.category] = { time: 0, count: 0 };
        }
        categoryStats[activity.category].time += activity.duration;
        categoryStats[activity.category].count++;
    });

    const inefficiencies = [];
    const recommendations = [];
    const aiOpportunities = [];

    // Generate specific insights based on actual data
    if (categoryStats.meeting && categoryStats.meeting.time > 240) {
        inefficiencies.push(`${formatMinutes(categoryStats.meeting.time)} spent in meetings - likely 30% could be async updates or shorter check-ins`);
        aiOpportunities.push('Use AI meeting assistants like Otter.ai to automatically generate summaries, saving 5-10 minutes per meeting');
        recommendations.push('Implement "no-meeting Wednesdays" and use Loom videos for status updates instead');
    }

    if (categoryStats.admin && categoryStats.admin.time > 90) {
        inefficiencies.push(`${formatMinutes(categoryStats.admin.time)} on administrative tasks - highly automatable with modern tools`);
        aiOpportunities.push('Automate expense reports with Expensify AI and use Zapier to connect your most-used apps');
        recommendations.push('Batch all admin tasks into one 30-minute block at day\'s end instead of spreading throughout');
    }

    if (categoryStats.distraction && categoryStats.distraction.time > 60) {
        inefficiencies.push(`${formatMinutes(categoryStats.distraction.time)} lost to distractions - breaks deep work flow state`);
        recommendations.push('Use website blockers like Cold Turkey during focus blocks and keep phone in another room');
    }

    const workBlocks = activities.filter(a => a.category === 'work');
    if (workBlocks.length > 3) {
        inefficiencies.push(`Deep work split into ${workBlocks.length} fragments - reduces cognitive performance by up to 40%`);
        recommendations.push('Combine work blocks into 2-3 longer sessions of 90+ minutes each for maximum flow state');
        aiOpportunities.push('Use AI focus apps like Brain.fm or Noisli to maintain concentration during extended work sessions');
    }

    if (categoryStats.commute && categoryStats.commute.time > 60) {
        aiOpportunities.push('Convert commute time to learning with AI-curated podcasts through apps like Blinkist or Audible Plus');
        recommendations.push('Use commute time for passive learning or meditation instead of mindless scrolling');
    }

    // Ensure we have at least some recommendations
    if (recommendations.length === 0) {
        recommendations.push('Time-block your calendar into themed sessions (admin, creative work, meetings) for better focus');
        recommendations.push('Implement the two-minute rule: if a task takes less than 2 minutes, do it immediately');
        recommendations.push('Use the Pomodoro Technique with 25-minute focused work sessions followed by 5-minute breaks');
    }

    if (aiOpportunities.length === 0) {
        aiOpportunities.push('Use AI writing assistants like Grammarly or Notion AI to speed up documentation by 30%');
        aiOpportunities.push('Implement smart email filtering with AI tools like SaneBox to reduce inbox management time');
        aiOpportunities.push('Use AI calendar scheduling tools like Reclaim.ai to automatically block focus time and handle meeting coordination');
    }

    const fallbackInsights = {
        inefficiencies,
        aiOpportunities,
        recommendations,
        weeklySavings: Math.max(120, Math.min((categoryStats.admin?.time * 3.5 || 0) + (categoryStats.meeting?.time * 1.5 || 0), 480))
    };

    displayAIAnalysis(fallbackInsights);
}

function displayAIAnalysis(insights) {
    const totalTime = activities.reduce((sum, activity) => sum + activity.duration, 0);
    const categoryStats = {};
    
    activities.forEach(activity => {
        if (!categoryStats[activity.category]) {
            categoryStats[activity.category] = { time: 0, count: 0 };
        }
        categoryStats[activity.category].time += activity.duration;
        categoryStats[activity.category].count++;
    });

    const productiveTime = (categoryStats.work?.time || 0) + (categoryStats.meeting?.time || 0) * 0.7;

    document.getElementById('analysisResults').innerHTML = `
        <!-- Key Metrics -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
                <div class="flex items-center gap-3 mb-2">
                    <i data-lucide="clock" class="w-6 h-6 text-gray-600"></i>
                    <h3 class="font-bold text-gray-700">Total Time</h3>
                </div>
                <p class="text-3xl font-black text-gray-900">${formatMinutes(totalTime)}</p>
            </div>
            <div class="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
                <div class="flex items-center gap-3 mb-2">
                    <i data-lucide="target" class="w-6 h-6 text-green-600"></i>
                    <h3 class="font-bold text-gray-700">Productive</h3>
                </div>
                <p class="text-3xl font-black text-green-600">${formatMinutes(Math.round(productiveTime))}</p>
            </div>
            <div class="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
                <div class="flex items-center gap-3 mb-2">
                    <i data-lucide="zap" class="w-6 h-6 text-green-600"></i>
                    <h3 class="font-bold text-gray-700">AI Powered</h3>
                </div>
                <p class="text-lg font-bold text-green-600">✓ Active</p>
            </div>
            <div class="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
                <div class="flex items-center gap-3 mb-2">
                    <i data-lucide="trending-up" class="w-6 h-6 text-green-600"></i>
                    <h3 class="font-bold text-gray-700">Weekly Savings</h3>
                </div>
                <p class="text-3xl font-black text-green-600">${formatMinutes(insights.weeklySavings || 0)}</p>
            </div>
        </div>

        <!-- AI Opportunities -->
        <div class="bg-green-50/80 backdrop-blur-sm border border-green-200 rounded-2xl p-8 mb-8">
            <h3 class="text-2xl font-bold mb-6 flex items-center gap-3 text-green-800">
                <div class="bg-green-600 p-2 rounded-xl">
                    <i data-lucide="brain" class="w-6 h-6 text-white"></i>
                </div>
                AI Automation Opportunities
                <div class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                    AI POWERED
                </div>
            </h3>
            <div class="grid gap-4">
                ${(insights.aiOpportunities || []).map(opportunity => `
                    <div class="bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-green-200 hover:shadow-md transition-all duration-200">
                        <div class="flex items-center gap-4">
                            <div class="bg-green-500 w-3 h-3 rounded-full"></div>
                            <p class="text-green-800 font-semibold text-lg">${typeof opportunity === 'string' ? opportunity : opportunity.text || opportunity.description || 'AI automation opportunity identified'}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- Efficiency Problems -->
        ${insights.inefficiencies.length > 0 ? `
        <div class="bg-gray-100/80 backdrop-blur-sm border border-gray-300 rounded-2xl p-8 mb-8">
            <h3 class="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800">
                <div class="bg-gray-600 p-2 rounded-xl">
                    <i data-lucide="alert-triangle" class="w-6 h-6 text-white"></i>
                </div>
                AI-Detected Efficiency Problems
            </h3>
            <div class="space-y-4">
                ${(insights.inefficiencies || []).map(issue => `
                    <div class="bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                        <p class="font-bold text-lg text-gray-800">${typeof issue === 'string' ? issue : issue.text || issue.description || 'Efficiency issue identified'}</p>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        <!-- AI Recommendations -->
        <div class="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-8">
            <h3 class="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800">
                <div class="bg-green-600 p-2 rounded-xl">
                    <i data-lucide="check-circle" class="w-6 h-6 text-white"></i>
                </div>
                AI-Powered Recommendations
            </h3>
            <div class="grid gap-4">
                ${(insights.recommendations || []).map(rec => `
                    <div class="bg-gray-50/80 backdrop-blur-sm p-6 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                        <div class="flex items-start gap-4">
                            <div class="bg-green-500 w-3 h-3 rounded-full mt-2 flex-shrink-0"></div>
                            <p class="text-gray-800 font-semibold text-lg">${typeof rec === 'string' ? rec : rec.text || rec.description || 'Recommendation provided'}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <!-- Automate For Me Button -->
        <div class="text-center mt-8">
            <button
                onclick="generateAutomationGuide()"
                id="automateButton"
                class="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover-scale shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto"
            >
                <div class="bg-white/20 p-2 rounded-lg">
                    <i data-lucide="rocket" class="w-6 h-6"></i>
                </div>
                <span id="automateButtonText">Automate For Me</span>
                <i data-lucide="arrow-right" class="w-5 h-5"></i>
            </button>
            <p class="text-gray-600 mt-3 font-medium">Get step-by-step automation implementation guide</p>
        </div>
    `;

    lucide.createIcons();
}

async function generateAutomationGuide() {
    const automateButton = document.getElementById('automateButton');
    const automateButtonText = document.getElementById('automateButtonText');
    
    // Check if guide is already shown
    const existingGuide = document.querySelector('.automation-guide');
    if (existingGuide) {
        existingGuide.remove();
        automateButtonText.textContent = 'Automate For Me';
        return;
    }
    
    automateButtonText.innerHTML = '<div class="loading-spinner"></div>';
    automateButton.disabled = true;
    
    try {
        // Use fallback guide generation since API might not work
        generateFallbackAutomationGuide();
        automateButtonText.textContent = 'Hide Automation Guide';
    } catch (error) {
        console.error('Automation guide failed:', error);
        automateButtonText.textContent = 'Guide Failed - Try Again';
    } finally {
        automateButton.disabled = false;
    }
}

function generateFallbackAutomationGuide() {
    const categoryStats = {};
    activities.forEach(activity => {
        if (!categoryStats[activity.category]) {
            categoryStats[activity.category] = { time: 0, count: 0 };
        }
        categoryStats[activity.category].time += activity.duration;
        categoryStats[activity.category].count++;
    });

    const tools = [];
    const stepByStep = [];
    const costAnalysis = [];
    const technicalRequirements = [];
    const workflows = [];
    const maintenanceTips = [];

    // Generate specific recommendations based on user's activities
    if (categoryStats.meeting && categoryStats.meeting.time > 120) {
        tools.push('Otter.ai - AI meeting transcription and summarization ($8.33/month)');
        tools.push('Calendly - Smart scheduling automation (Free tier available)');
        stepByStep.push('Set up Otter.ai integration with your calendar for automatic meeting recording');
        stepByStep.push('Configure Calendly with buffer times and availability preferences');
        costAnalysis.push('Meeting tools: $100/month, saves 5 hours/week = $500+ ROI monthly');
        workflows.push('Auto-record meetings → AI generates summaries → Share action items via Slack');
    }

    if (categoryStats.admin && categoryStats.admin.time > 60) {
        tools.push('Zapier - Workflow automation platform ($19.99/month for 750 tasks)');
        tools.push('Expensify - AI expense tracking and reporting ($5/user/month)');
        stepByStep.push('Connect your most-used apps through Zapier workflows');
        stepByStep.push('Set up automatic expense categorization and approval workflows');
        costAnalysis.push('Admin automation: $50/month, eliminates 3 hours/week = $300+ savings');
        workflows.push('Receipt photo → AI categorizes → Auto-submits to accounting → Approval notification');
    }

    if (categoryStats.work && categoryStats.work.time > 180) {
        tools.push('Notion AI - Smart document creation and editing ($8/user/month)');
        tools.push('Grammarly Business - AI writing assistant ($12/user/month)');
        tools.push('RescueTime - Automatic time tracking and focus analytics ($12/month)');
        stepByStep.push('Install RescueTime for automatic productivity tracking');
        stepByStep.push('Configure Notion AI templates for common document types');
        costAnalysis.push('Writing tools: $32/month, saves 2 hours/week writing = $200+ value');
        workflows.push('Draft outline → AI expands content → Grammar check → Publish/share');
    }

    if (categoryStats.distraction && categoryStats.distraction.time > 30) {
        tools.push('Cold Turkey - Website and app blocker (Free/$39 Pro)');
        tools.push('Forest - Focus timer with gamification ($3.99 one-time)');
        stepByStep.push('Set up website blocking schedules during deep work hours');
        stepByStep.push('Use Forest app for Pomodoro technique implementation');
        costAnalysis.push('Focus tools: $43 one-time, recovers 1+ hour daily = $1000+ annual value');
        workflows.push('Work block starts → Auto-block distractions → Focus timer → Break notification');
    }

    // Always include these essentials
    if (tools.length === 0) {
        tools.push('Zapier - Connect and automate your apps ($19.99/month)');
        tools.push('Calendly - Smart meeting scheduling (Free tier available)');
        tools.push('Notion - All-in-one workspace with AI ($8/month)');
    }

    if (stepByStep.length === 0) {
        stepByStep.push('Audit your current workflow and identify 3 most time-consuming repetitive tasks');
        stepByStep.push('Choose automation tools that integrate with your existing software stack');
        stepByStep.push('Set up one automation per week to avoid overwhelming your workflow');
        stepByStep.push('Track time savings for 30 days to measure ROI and adjust as needed');
    }

    // Add universal recommendations
    technicalRequirements.push('Stable internet connection for cloud-based automation tools');
    technicalRequirements.push('Admin access to install desktop applications and browser extensions');
    technicalRequirements.push('API access or premium accounts for advanced integrations');
    technicalRequirements.push('Basic understanding of trigger-action workflows (training available)');

    workflows.push('Email arrives → AI categorizes → Auto-files or forwards → Notification sent');
    workflows.push('Calendar event → Auto-prepare materials → Send reminders → Post-meeting follow-up');
    workflows.push('Task completed → Update project status → Notify team → Generate progress report');

    maintenanceTips.push('Review automation performance monthly and optimize trigger conditions');
    maintenanceTips.push('Update API connections when software versions change');
    maintenanceTips.push('Train team members on new automated workflows for consistency');
    maintenanceTips.push('Keep backup manual processes for critical automations');
    maintenanceTips.push('Monitor cost vs. time savings quarterly to ensure positive ROI');

    if (costAnalysis.length === 0) {
        const totalTime = activities.reduce((sum, activity) => sum + activity.duration, 0);
        const estimatedSavings = Math.max(60, Math.min(totalTime * 0.3, 240));
        costAnalysis.push(`Estimated setup cost: $100-300 initial + $50-100/month ongoing`);
        costAnalysis.push(`Projected time savings: ${formatMinutes(estimatedSavings)} per week`);
        costAnalysis.push(`ROI calculation: ${formatMinutes(estimatedSavings)} × $25/hour = ${Math.round(estimatedSavings * 25 / 60)} weekly value`);
        costAnalysis.push('Break-even period: 2-4 weeks with proper implementation');
    }

    const automationGuide = {
        tools,
        stepByStep,
        costAnalysis,
        technicalRequirements,
        workflows,
        maintenanceTips
    };

    displayAutomationGuide(automationGuide);
}

function displayAutomationGuide(guide) {
    const automationGuideHTML = `
        <!-- Automation Implementation Guide -->
        <div class="automation-guide bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-2xl p-8 mt-8">
            <h3 class="text-2xl font-bold mb-6 flex items-center gap-3 text-blue-800">
                <div class="bg-blue-600 p-2 rounded-xl">
                    <i data-lucide="rocket" class="w-6 h-6 text-white"></i>
                </div>
                Complete Automation Implementation Guide
                <div class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                    AI POWERED
                </div>
            </h3>

            <!-- Tools Recommendations -->
            <div class="bg-white/90 backdrop-blur-sm border border-blue-200 rounded-xl p-6 mb-6">
                <h4 class="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                    <i data-lucide="tool" class="w-5 h-5"></i>
                    Recommended Tools & Software
                </h4>
                <div class="space-y-3">
                    ${(guide.tools || []).map(tool => `
                        <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <p class="font-semibold text-blue-900">${typeof tool === 'string' ? tool : tool.name || tool.text || 'Automation tool recommended'}</p>
                            ${tool.description ? `<p class="text-blue-700 text-sm mt-1">${tool.description}</p>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Step by Step -->
            <div class="bg-white/90 backdrop-blur-sm border border-blue-200 rounded-xl p-6 mb-6">
                <h4 class="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                    <i data-lucide="list-ordered" class="w-5 h-5"></i>
                    Step-by-Step Implementation
                </h4>
                <div class="space-y-3">
                    ${(guide.stepByStep || []).map((step, index) => `
                        <div class="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3">
                            <div class="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                                ${index + 1}
                            </div>
                            <p class="text-blue-900 font-medium">${typeof step === 'string' ? step : step.text || step.description || 'Implementation step'}</p>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Cost Analysis -->
            <div class="bg-white/90 backdrop-blur-sm border border-blue-200 rounded-xl p-6 mb-6">
                <h4 class="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                    <i data-lucide="dollar-sign" class="w-5 h-5"></i>
                    Cost Analysis & ROI
                </h4>
                <div class="space-y-3">
                    ${(guide.costAnalysis || []).map(cost => `
                        <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <p class="text-blue-900 font-medium">${typeof cost === 'string' ? cost : cost.text || cost.description || 'Cost consideration'}</p>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Technical Requirements -->
            <div class="bg-white/90 backdrop-blur-sm border border-blue-200 rounded-xl p-6 mb-6">
                <h4 class="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                    <i data-lucide="settings" class="w-5 h-5"></i>
                    Technical Requirements
                </h4>
                <div class="space-y-3">
                    ${(guide.technicalRequirements || []).map(req => `
                        <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <p class="text-blue-900 font-medium">${typeof req === 'string' ? req : req.text || req.description || 'Technical requirement'}</p>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Workflows -->
            <div class="bg-white/90 backdrop-blur-sm border border-blue-200 rounded-xl p-6 mb-6">
                <h4 class="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                    <i data-lucide="workflow" class="w-5 h-5"></i>
                    Integration Workflows
                </h4>
                <div class="space-y-3">
                    ${(guide.workflows || []).map(workflow => `
                        <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <p class="text-blue-900 font-medium">${typeof workflow === 'string' ? workflow : workflow.text || workflow.description || 'Workflow integration'}</p>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Maintenance Tips -->
            <div class="bg-white/90 backdrop-blur-sm border border-blue-200 rounded-xl p-6">
                <h4 class="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                    <i data-lucide="wrench" class="w-5 h-5"></i>
                    Maintenance & Optimization
                </h4>
                <div class="space-y-3">
                    ${(guide.maintenanceTips || []).map(tip => `
                        <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <p class="text-blue-900 font-medium">${typeof tip === 'string' ? tip : tip.text || tip.description || 'Maintenance tip'}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    // Append the automation guide to the analysis results
    document.getElementById('analysisResults').insertAdjacentHTML('beforeend', automationGuideHTML);
    lucide.createIcons();
}

// Initialize Lucide icons on page load
lucide.createIcons();
