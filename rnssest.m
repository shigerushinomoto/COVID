function [R,itvl,rate] = rnssest(n,N,gm)
%
% Function 'rnssest' returns the reproduction number 
% estimated by a state-space method
%
% Input arguments:
% n:    new cases (vector array). 
% N (optinal):
%       Number of particles used in sequential Monte Carlo method.
%       The default value is 1e4. 
% gm (optinal): 
%       The scale parameter of Cauchy distribution. 
%       The default value is 1e-2. 
%
% Output arguments:
% R:    Estimated reproduction number (posterior median)
% itvl: 2.5 and 97.5 percent points
%       * Note that the number of elements in R and itvl is numel(n)-1.
% rate: estimated rate of new cases
% 
% Usage:
% >> [R,itvl,rate] = rnssest(n);
% When only n is given in the input arguments, N and gm are set to the
% default values. 
%
% >> [R,itvl,rate] = rnssest(n,1e5);
% The number of particles is set to 1e5. 
%
% >> [R,itvl,rate] = rnssest(n,1e6,1e-3);
% The number of particles and the scale parameter of Cauchy distribution
% are set to 1e6 and 1e-3, respectively.
%
% >> rnssest(n);
% By calling the function without output arguments, the estimated rate and
% the estimated reproduction number are displayed along with data and 95% 
% credible intervals.
% 
%
% Shinsuke Koyama <skoyama at ism dot ac dot jp>
%
% HISTORY:
% Version 1.0: 2020-07-02.
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

if nargin == 1
    N = 1e4;
    gm = 1e-2;
elseif nargin == 2
    gm = 1e-2;
end

n = n(:)';      % data
I = find(isnan(n));  % missing data
n(I) = 0; 

T = numel(n);   % data length
mu = eps;    % background rate
rho = rhoest(n,7); % over-dispersion parameter
d = 30;         % state dimension
L = 30;         % interval for smoothing
F = [eye(1,d);[eye(d-1),zeros(d-1,1)]]; % coefficient of system model
G = eye(d,1);   % coefficient of system model

% parameters of log-normal kernel
m = 4.7;
sd = 2.9;
pk.mu = log(m/sqrt(1+(sd/m)^2));
pk.sg2 = log(1+(sd/m)^2);

% particle filtering and smoothing
sx = zeros(d,N,L);
R  = [];
itvl = [];
px = rand(d,N)*10;  % initial distribution (unifrom distribution over [0 10])
for t=1:T
    sx(:,:,end) = px;
    if ~ismember(t,I)
        n0 = [n(max(t-1,0):-1:max(t-d,1)),zeros(size(t-d:0))];
        lm = mu + (n0.*knl(1:d,pk))*px;
        if rho>0
            w = nbinpdf(n(t),lm/rho,1/(rho+1));
        else
            w = poisspdf(n(t),lm);
        end
        if ~isempty(find(w,1))
            newp=randsample(1:N,N,true,w);
            sx = sx(:,newp,:);
        end
    end
    R = [R, median(sx(1,:,1))];
    itvl = [itvl, quantile(sx(1,:,1),[0.025;0.975])];
    px = ramp(F*sx(:,:,end)+G*cauchyrnd(0,gm,1,N));
    sx(:,:,1:end-1) = sx(:,:,2:end);
end

for t=1:L-1
    R = [R, median(sx(1,:,t))];
    itvl = [itvl, quantile(sx(1,:,t),[0.025;0.975])];
end
R = R(L+1:end);
itvl = itvl(:,L+1:end);

rate = zeros(1,T);
for t=1:T
    h = sum(R(1:t-1).*n(1:t-1).*knl(t-1:-1:1,pk));
    rate(t) = mu+h;
end

% Display results
if nargout == 0
    tt = 1:T;
    figure;
    subplot1 = subplot(2,1,1);
    hold on
    plot(tt,n,'DisplayName','data','LineWidth',1.5,...
        'Color',[0.466666668653488 0.674509823322296 0.18823529779911]);
    plot(tt,rate,'DisplayName','rate estimation','LineWidth',1.5,...
        'Color',[0 0.447058826684952 0.74117648601532]);
    legend
    xlim([tt(1),tt(end)]);
    ylabel('new cases')
    box(subplot1,'on');
    subplot2 = subplot(2,1,2);
    hold on
    ar1 = area(tt(1:end-1),itvl(2,:),'EdgeColor','none');
    ar2 = area(tt(1:end-1),itvl(1,:),'EdgeColor','none');
    set(ar1,...
        'FaceColor',[0.729411780834198 0.831372559070587 0.95686274766922]);
    set(ar2,'FaceColor',[1 1 1])
    p1 = plot(tt(1:end-1),R,'LineWidth',1.5,...
        'Color',[0 0.447058826684952 0.74117648601532]);
    plot(tt,ones(size(tt)),'k:','LineWidth',1);
    legend([p1 ar1],'estimation','95% interval')
    xlim([tt(1),tt(end)]);
    ylabel('reproduction number')
    box(subplot2,'on');
end


% log-normal kernel
function y = knl(t,p)
y = P(t,p)-P(t-1,p);

function y = P(t,p)
y = 0.5*erfc(-(log(t)-p.mu)/(sqrt(2*p.sg2)));

% estimate rho
function rho = rhoest(n,l)
n(isnan(n))=0;
mn = conv(n,ones(1,l)/l,'same');
rho = mean((n(mn~=0)-mn(mn~=0)).^2./mn(mn~=0))-1;

% Cauchy random number
function r = cauchyrnd(x0,gm,m,n)
r = x0+gm.*tan(pi*(rand(m,n)-0.5));

% ramp function
function x = ramp(x)
x(x<eps)=eps;
