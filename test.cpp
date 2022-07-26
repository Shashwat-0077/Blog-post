#include<iostream>
#include<string.h>
#include<math.h>
using namespace std;

class maths {
    int s;

public:
    int a, d, count = 0;
    void read();

    void digit() {

        do {
            d = s % 10;
            count++;
            s = s / 10;
        } while (s != 0);

        cout << count;

    }
    //	void check(){
//		for(int i = 1;i<=s.lenght();i++){
//			a = s/10;
//			if(a!=0 && a!=1){
//				cout<<"Wrong string entered:";
//			}
//			else{
//				cout<<"Binary string!";
//			}
//		}
//	}
};

void maths::read() {
    cout << "Enter the string:";
    cin >> s;
}

int main() {
    maths m;
    m.read();
    m.digit();
    //	c.enter();

    return 0;
}