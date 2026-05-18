---
title: "2024 昆明邀请赛 VP 记录"
description: "把之前 CSDN 上的 VP 记录迁移回来：5 题通过、800 罚时，从贪心、二分填数、异或构造、字符串环处理到前后缀 GCD 的赛后复盘。"
pubDate: 2024-06-01
updatedDate: 2026-05-18
tags: ["算法", "ICPC", "VP", "C++"]
featured: false
coverTone: "ink"
coverLabel: "ICPC"
draft: false
---

这篇是从 CSDN 迁回来的旧文，原文写得比较随手：题面截图、几句思路、代码一贴就结束了。迁到本站后，我把它整理成更适合复盘的版本：每题先放题面截图，再补上“关键观察”和“实现要点”，最后保留当时的代码。

这场 2024 昆明邀请赛 VP 最后过了 5 题，800 罚时，铜尾。离牌子很近，也很明显地暴露了几个问题：签到题卡太久、字符串题没有及时和队友同步正确思路、一些低级变量写错带来了额外罚时。

## 比赛概览

| 题目 | 关键词 | 当时处理 |
| --- | --- | --- |
| 题 1 | 取模、补齐、贪心 | 先算已有贡献，再按补齐成本从小到大吃预算 |
| 题 2 | 排名约束、二分、贪心填数 | 按星级排序，二分缺失位置的最小填充值 |
| 题 3 | 前缀异或、构造 | 发现前缀异或为 0 时交换相邻输出 |
| 题 4 | 环形字符串、连续段 | 构造首尾不同，再统计可删除次数 |
| 题 5 | 前后缀 GCD | 利用 GCD 变化次数有限，枚举有效前缀断点 |

## 题 1：补齐取模后的贪心

![题 1 题面](/images/blog/kunming-2024-vp/problem-1.png)

这题思路比较直接。每个 `a[i]` 先贡献 `a[i] / k`，剩余部分如果想再凑出一个完整的 `k`，需要的成本是 `k - a[i] % k`。

把所有补齐成本从小到大排序，用额外预算 `m` 尽量补齐更多项。最后如果 `m` 还有剩余，直接 `ans += m / k`。

```cpp
#include<bits/stdc++.h>
using namespace std;
#define int long long
#define PLL pair<int,int>
#define endl '\n'

void solve() {
    int n, k; cin >> n >> k;
    int a[110];
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }
    int ans = 0;
    for (int i = 0; i < n; i++) {
        ans += a[i] / k;
        a[i] = a[i] % k;
        a[i] = k - a[i];
    }
    sort(a, a + n);
    int m; cin >> m;
    for (int i = 0; i < n; i++) {
        if (m == 0)break;
        if (m >= a[i]) {
            m -= a[i];
            ans++;
        }
    }
    ans += m / k;
    cout << ans << endl;
}
signed main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cout.tie(nullptr);
    int t;
    //t = 1;
    cin >> t;
    while (t--) {
        solve();
    }
    return 0;
}
```

## 题 2：按排名约束填缺失分数

![题 2 题面](/images/blog/kunming-2024-vp/problem-2.png)

这题是队友赛时写的。大方向是：有些格子缺失，用 `-1` 表示；每个缺失值可以在 `[0, k]` 里选择。题目要求在排名或星级约束下，让每一行的总分满足严格关系。

实现里先把已知分数和缺失数量统计出来，再按第一关键字从大到小处理。对当前行二分一个填充值，使这一行最终总分刚好压在上一组限制之下。星级相同的情况要单独处理，否则容易 WA。

```cpp
#include <bits/stdc++.h>
using namespace std;
#define int long long
void solve() {
    int n, m,k;
    cin >> n >> m>>k;
    vector<vector<int>>arr(n + 5, vector<int>(m + 5, 0));
    vector<pair<int, int>> s(n + 5);
    map<int, int> sum,sum2;
    for (int i = 1; i <= n; i++) {
        int x;
        cin >> x;
        s[i] = {x, i};
        for (int j = 1; j <= m; j++) {
            cin>>arr[i][j];
            if(arr[i][j]!=-1)sum[i]+=arr[i][j];
            else sum2[i]+=1;
        }
    }
    sort(s.begin()+1, s.begin()+n+1,greater<pair<int,int>>());
    int last1 = 1e18,last2=1e18,lastx=-1;
    for (int i = 1; i <=n; i++) {
        int l = 0, r = k;
        int last;
        if (s[i].first != lastx)
        {
            last = last1;
        }
        else
        {
            last = last2;
        }
        if (sum[s[i].second] >= last)
        {
            cout<<"No"<<endl;
            return;
        }
        while (l <= r) {
            int mid = (l + r) / 2;
            int cnt = sum[s[i].second]+sum2[s[i].second]*mid;
            if (cnt < last) {
                l = mid + 1;
            } else {
                r = mid - 1;
            }
        }
        int minsum=sum[s[i].second]+sum2[s[i].second]*(l-1);
        for (int j = 1; j <= m; j++)
        {
            if (arr[s[i].second][j]== -1)
            {
                if (minsum + 1 < last&&l<=k)
                {
                    arr[s[i].second][j] = l;
                    minsum += 1;
                }
                else arr[s[i].second][j] = l-1;
            }
        }
        if (s[i].first != lastx)
        {
            last2 = last1;
            last1 = minsum;
            lastx=s[i].first;
        }
        else
        {
            last1 = min(last1,minsum);
        }
    }
    cout<<"Yes"<<endl;
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            cout<<arr[i][j]<<" ";
        }
        cout<<endl;
    }
}
signed main() {
    int _;
    cin >> _;
    while (_--) {
        solve();
    }
    return 0;
}
```

## 题 3：前缀异或为 0 时交换相邻项

![题 3 题面](/images/blog/kunming-2024-vp/problem-3.png)

这题是构造。手写几个例子后会发现：顺序输出 `0..n-1` 时，如果当前前缀异或和变成 `0`，就把 `i` 和 `i + 1` 的输出顺序交换一下。

如果一开始整体异或和就是 `0`，说明无法构造，直接输出 `impossible`。

```cpp
#include <bits/stdc++.h>
using namespace std;
#define int long long
void solve() {
    int n;
    cin >> n;
    int sum = 0;
    for (int i = 0; i < n; i++) {
        sum ^= i;
    }
    if(sum==0)cout<<"impossible" << endl;
    else
    {
        int sum = 0;
        for (int i = 0; i < n; i++) {
            sum ^= i;
            if (sum == 0)
            {
                sum ^= (i + 1);
                cout << i + 1 << " " << i << " ";
                i++;
            }
            else
            {
                cout << i << " " ;
            }
        }
        cout << endl;
    }
}
signed main() {
    int _;
    cin >> _;
    while (_--) {
        solve();
    }
    return 0;
}
```

## 题 4：环形字符串的连续段处理

![题 4 题面](/images/blog/kunming-2024-vp/problem-4.png)

这题赛时有点可惜。我当时已经有接近正确的思路，但没有及时和队友讨论清楚，两个人各自 WA 了几发，罚时直接起飞。

关键观察是：只能左移一次，所以要先构造一种首尾字符不同的形式，再按连续相同字符段统计答案。只有出现偶数长度的相同字符段时，才可能让最终答案再减一。

```cpp
#include <bits/stdc++.h>
using namespace std;
#define endl '\n'
#define int long long
#define pb push_back
//memset(a,0,sizeof(a));清空数组a
//bool cmp(pair<int , int>& a , pair<int , int>& b) {return a.first < b.first;}自定义排序函数
//vector<pair<int , int>> v(n);v[0].first = 1;v[0].second = 2;
//sort(v.begin() , v.end() , cmp);
//auto it = lower_bound(b.begin(), b.end(), a);
//找到第一个大于等于a的位置,会自动使用二分查找算法
//unordered_map<int, int> mp;
//next_permutation(a+1,a+n+1);全排列
void work() {
    string s;
    cin >> s;
    int n = s.size();
    int ans = 0;
    int cnt1,cnt2;
    int flag1 = 0;
    for (int i = 0; i < n-1; i++) {
        if (s[i] !=s[i+1]) {
            flag1 = 1;
            cnt1 = i;
            cnt2 = i+1;
            break;
        }
    }
    if(flag1 == 0){
        ans=n/2;
        cout<<ans<<endl;
        return;
    }
    string t = s.substr(cnt2,n-cnt2+1);
    t+=s.substr(0,cnt1+1);
    //cout<<t<<endl;
    int num=1;int flag2=0;
    for(int i=0;i<n;i++){
        while(t[i]==t[i+1]){
            num++;
            i++;
        }
        if(num%2==0){
            flag2=1;
        }
        ans+=num/2;
        num=1;
    }
    if(flag2) ans--;
    cout<<ans<<endl;
}

signed main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cout.tie(nullptr);
    int tt;
    cin >> tt;

    while (tt--) {
        work();
    }

    return 0;
}
```

## 题 5：前后缀 GCD 降低枚举量

![题 5 题面](/images/blog/kunming-2024-vp/problem-5.png)

这题是我这场最后发挥了一点作用的题。观察到 `a[i]` 最大到 `1e18`，但前缀 GCD 的有效变化次数是对数级的。于是可以预处理：

- `l[i]`：前 `i` 个数的 GCD。
- `r[i]`：从 `i` 到 `n` 的后缀 GCD。

只有当前缀 GCD 发生变化时，才需要枚举后面的区间，把区间内元素加上 `k` 后再和后缀拼起来求最大 GCD。

```cpp
#include <bits/stdc++.h>
using namespace std;
#define endl '\n'
#define int long long
#define pb push_back
//memset(a,0,sizeof(a));清空数组a
//bool cmp(pair<int , int>& a , pair<int , int>& b) {return a.first < b.first;}自定义排序函数
//vector<pair<int , int>> v(n);v[0].first = 1;v[0].second = 2;
//sort(v.begin() , v.end() , cmp);
//auto it = lower_bound(b.begin(), b.end(), a);
//找到第一个大于等于a的位置,会自动使用二分查找算法
//unordered_map<int, int> mp;
//next_permutation(a+1,a+n+1);全排列
int gcd(int a, int b) {
    if (b == 0) return a;
    if(a==0) return b;
    return gcd(b, a % b);
}
void work() {
  int n,k;
  cin >> n >> k;
  vector<int> a(n+5,0),l(n+5,0),r(n+5,0);
  for (int i = 1; i <=n; i++) {
    cin >> a[i];
  }
  for(int i=1;i<=n;i++){
    l[i]=gcd(l[i-1],a[i]);
  }
  for(int i=n;i>=1;i--){
    r[i]=gcd(r[i+1],a[i]);
  }
  int ans=l[n];
  for(int i=1;i<=n;i++){
    if(l[i]!=l[i-1]){//l[i+1]!=l[i]
      int temp=l[i-1];
      for(int j=i;j<=n;j++){
        temp=gcd(temp,a[j]+k);
        ans=max(ans,gcd(temp,r[j+1]));
    }
    }
  }
  cout<<ans<<endl;
}

signed main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cout.tie(nullptr);
    int tt;
    cin >> tt;

    while (tt--) {
        work();
    }

    return 0;
}
```

## 赛后总结

SUA 是最好的出题组。

最后 5 题 800 罚时，铜尾，算是离牌子最近的一次。现在回头看，如果开头签到顺一点、罚时控制在 500 左右，银牌区是有机会摸到的。

这场最该记住的不是某个算法模板，而是协作节奏：

- 开头的签到因为一个 `n` 写成 `m` 卡了 20 分钟，这种错误应该更快通过互查发现。
- 最小字典序异或和那题没有快速抓到构造点，说明赛时手推样例还可以更果断。
- 字符串题我没有把正确思路跟队友讲清楚，导致重复试错和多发 WA。
- 前中期我几乎是罚时制造机，最后靠前后缀 GCD 找回了一点存在感。

日常靠队友带飞，但这种接近牌子的场，反而更能看清哪里还能再进步。
