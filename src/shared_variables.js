export const chartoptions = {
  responsive: true,
  maintainAspectRatio: false,
  legend: {
    position: 'bottom',
  },
  tooltips: {
    mode: 'index'
  },
  scales: {
      yAxes: [{
        stacked: true,
        ticks: {
          beginAtZero: true,
        },
        id: 'A',
        type: 'linear',
        position: 'left',
        gridLines: {
          display: false,
        }
      },
      {
        ticks: {
          beginAtZero: true,
        },
        id: 'B',
        type: 'linear',
        position: 'right',
        gridLines: {
          display: true,
        }
      }
      ],
      xAxes: [{
        stacked: true
      }],
  }
};