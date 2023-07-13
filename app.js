// app.js

// Fetch user tasks from the API
function fetchUserTasks() {
    return fetch('/tasks')
      .then(response => response.json())
      .catch(error => console.error('Error fetching tasks:', error));
  }
  
  // Render the dashboard
  function renderDashboard(tasks) {
    // Add your D3.js code here to create visualizations and interactive components
    // based on the tasks data received.
    renderTable(tasks);
    renderBarChart(tasks);
  }
  
  // Render the table
  function renderTable(tasks) {
    const tableContainer = d3.select('#dashboard')
      .append('div')
      .attr('class', 'table-container');
  
    const table = tableContainer.append('table');
    const thead = table.append('thead');
    const tbody = table.append('tbody');
  
    // Table header
    const columns = ['Title', 'Description', 'Due Date', 'Status', 'Assigned User'];
    thead.append('tr')
      .selectAll('th')
      .data(columns)
      .join('th')
      .text(d => d);
  
    // Table rows
    const rows = tbody.selectAll('tr')
      .data(tasks)
      .join('tr');
  
    rows.append('td')
      .text(d => d.title);
  
    rows.append('td')
      .text(d => d.description);
  
    rows.append('td')
      .text(d => d.dueDate);
  
    rows.append('td')
      .text(d => d.status);
  
    rows.append('td')
      .text(d => d.assignedUser.username);
  }
  
  // Render the bar chart
  function renderBarChart(tasks) {
    const chartContainer = d3.select('#dashboard')
      .append('div')
      .attr('class', 'chart-container');
  
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
  
    const svg = chartContainer.append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
  
    // Prepare data for the chart
    const data = d3.rollups(tasks, v => v.length, d => d.status);
  
    // Define scales and axes
    const xScale = d3.scaleBand()
      .domain(data.map(d => d[0]))
      .range([0, width])
      .padding(0.1);
  
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d[1])])
      .range([height, 0]);
  
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);
  
    // Render bars
    svg.selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', d => xScale(d[0]))
      .attr('y', d => yScale(d[1]))
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - yScale(d[1]))
      .attr('fill', 'steelblue');
  
    // Render x-axis
    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis);
  
    // Render y-axis
    svg.append('g')
      .attr('class', 'y-axis')
      .call(yAxis);
  }
  
  // Main function
  function main() {
    fetchUserTasks()
      .then(tasks => renderDashboard(tasks))
      .catch(error => console.error('Error:', error));
  }
  
  // Call the main function when the DOM is ready
  document.addEventListener('DOMContentLoaded', main);
  